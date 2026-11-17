import json,uuid,pathlib
root=pathlib.Path(__file__).resolve().parent.parent/'n8n'
root.mkdir(exist_ok=True)
def node(name,typ,version,params,x,y,**extras):
    o=dict(id=str(uuid.uuid5(uuid.NAMESPACE_URL,'era-snap:'+name)),name=name,type='n8n-nodes-base.'+typ,typeVersion=version,position=[x,y],parameters=params)
    o.update(extras);return o
def workflow(name,nodes,edges,path):
    connections={name:{'main':[[{'node':dest,'type':'main','index':0} for dest in dests]]} for name,dests in edges.items()}
    obj=dict(name=name,nodes=nodes,connections=connections,active=False,settings={'executionOrder':'v1','timezone':'Asia/Jakarta'},tags=[],pinData={},meta={'templateCredsSetupCompleted':False})
    (root/path).write_text(json.dumps(obj,ensure_ascii=False,indent=2),encoding='utf-8')
def header(key='INTERNAL_API_KEY'):
    return {'sendHeaders':True,'headerParameters':{'parameters':[{'name':'x-internal-api-key','value':f'={{{{ $env.{key} }}}}'}]}}
def httpget(name,url,x,y):
    return node(name,'httpRequest',4.2,{'method':'GET','url':url,**header(),'options':{}},x,y)
def http_post(name,url,body,x,y):
    return node(name,'httpRequest',4.2,{'method':'POST','url':url,**header(),'sendBody':True,'specifyBody':'json','jsonBody':body,'options':{}},x,y)
def google_folder(name,x,y):
    return node(name,'googleDrive',3,{'resource':'folder','operation':'create','name':"={{ 'Jasmine-' + $('Verify Delivery').item.json.orderId }}",'driveId':{'__rl':True,'value':'My Drive','mode':'list'},'folderId':{'__rl':True,'value':'root','mode':'list'},'options':{}},x,y)
def sheets(name,sheet,fields,x,y):
    schema=[{'id':key,'displayName':key,'required':False,'defaultMatch':False,'display':True,'type':'string','canBeUsedToMatch':True} for key in fields]
    return node(name,'googleSheets',4.7,{'operation':'append','documentId':{'__rl':True,'value':'={{ $env.GOOGLE_SHEET_ID }}','mode':'id'},'sheetName':{'__rl':True,'value':sheet,'mode':'name'},'columns':{'mappingMode':'defineBelow','value':fields,'matchingColumns':[],'schema':schema,'attemptToConvertTypes':False,'convertFieldsToString':True},'options':{}},x,y)
def gmail(name,to,subject,msg,x,y):
    return node(name,'gmail',2.2,{'resource':'message','operation':'send','sendTo':to,'subject':subject,'emailType':'text','message':msg,'options':{}},x,y)
def telegram(name,msg,x,y):
    return node(name,'telegram',1.2,{'resource':'message','operation':'sendMessage','chatId':'={{ $env.TELEGRAM_CS_CHAT_ID }}','text':msg,'additionalFields':{}},x,y)

# Workflow 01: payments are verified by API before this webhook is enqueued; no direct customer webhook can unlock delivery.
w=[node('Delivery Webhook','webhook',2.1,{'httpMethod':'POST','path':'era-snap-delivery','responseMode':'onReceived','options':{}},-1240,280),
 node('Verify Delivery','code',2,{'mode':'runOnceForAllItems','jsCode':"const x = $input.first().json; const provided = x.headers?.['x-fotobox-secret']; if (!provided || provided !== $env.N8N_SHARED_SECRET) throw new Error('Unauthorized webhook'); const orderId = x.body?.orderId; if (!/^JSM-[A-F0-9]{16}$/.test(orderId||'')) throw new Error('Invalid order ID'); return [{json:{orderId}}];"},-1030,280),
 httpget('Get Order Metadata',"={{ 'http://api:4000/internal/orders/' + $('Verify Delivery').item.json.orderId + '/meta' }}",-820,280),
 google_folder('Create Session Folder',-610,280),
 node('Fetch Private Photo','httpRequest',4.2,{'method':'GET','url':"={{ 'http://api:4000/internal/orders/' + $('Verify Delivery').item.json.orderId + '/strip' }}",**header(),'options':{'response':{'response':{'responseFormat':'file','outputPropertyName':'photo'}}}},-390,280),
 node('Upload File to Drive','googleDrive',3,{'resource':'file','operation':'upload','inputDataFieldName':'photo','name':"={{ $('Verify Delivery').item.json.orderId + '-two-strips.jpg' }}",'driveId':{'__rl':True,'value':'My Drive','mode':'list'},'folderId':{'__rl':True,'value':"={{ $('Create Session Folder').item.json.id }}",'mode':'id'},'options':{}},-160,280),
 node('Share Privately With Customer','googleDrive',3,{'resource':'file','operation':'share','fileId':{'__rl':True,'value':"={{ $('Upload File to Drive').item.json.id }}",'mode':'id'},'permissionsUi':{'permissionsValues':{'role':'reader','type':'user','emailAddress':"={{ $('Get Order Metadata').item.json.email }}"}},'options':{'sendNotificationEmail':False}},55,280),
 http_post('Confirm Drive Success',"={{ 'http://api:4000/internal/orders/' + $('Verify Delivery').item.json.orderId + '/ready' }}", "={{ JSON.stringify({fileId: $('Upload File to Drive').item.json.id}) }}",280,280),
 sheets('Append Finance Row','Transaksi',{
  'timestamp':"={{ $('Get Order Metadata').item.json.created_at }}",'order_id':"={{ $('Get Order Metadata').item.json.id }}",'name':"={{ $('Get Order Metadata').item.json.name }}",'email':"={{ $('Get Order Metadata').item.json.email }}",'phone':"={{ $('Get Order Metadata').item.json.phone }}",'theme':"={{ $('Get Order Metadata').item.json.theme }}",'amount_idr':"={{ $('Get Order Metadata').item.json.price_idr }}",'status':'PAID','drive_file_id':"={{ $('Upload File to Drive').item.json.id }}",'drive_link':"={{ 'https://drive.google.com/file/d/'+$('Upload File to Drive').item.json.id+'/view' }}"},520,70),
 gmail('Email Customer',"={{ $('Get Order Metadata').item.json.email }}","={{ 'Foto Era Snap kamu sudah siap - '+$('Get Order Metadata').item.json.id }}","={{ 'Halo '+$('Get Order Metadata').item.json.name+',\\n\\nTerima kasih sudah foto di Era Snap! Dua strip foto kamu sudah tersimpan di Google Drive dan aksesnya sudah diberikan ke email ini.\\n\\nLihat fotomu: https://drive.google.com/file/d/'+$('Upload File to Drive').item.json.id+'/view\\nOrder ID: '+$('Get Order Metadata').item.json.id+'\\n\\nLove, Era Snap ♡' }}",520,275),
 telegram('Notify CS Telegram',"={{ '✅ Order selesai: '+$('Get Order Metadata').item.json.id+' | Rp '+$('Get Order Metadata').item.json.price_idr+' | '+$('Get Order Metadata').item.json.theme+' | Drive ID: '+$('Upload File to Drive').item.json.id+' (jangan forward data pelanggan)' }}",520,480)]
edges={w[i]['name']:[w[i+1]['name']] for i in range(7)}
edges[w[7]['name']]=[w[8]['name'],w[9]['name'],w[10]['name']]
workflow('Era Snap 01 - Drive / Finance / Email / Telegram',w,edges,'01-delivery.json')

w=[node('Lead Webhook','webhook',2.1,{'httpMethod':'POST','path':'era-snap-lead','responseMode':'onReceived','options':{}},-600,220),
 node('Verify Lead','code',2,{'mode':'runOnceForAllItems','jsCode':"const x=$input.first().json; if (!x.headers?.['x-fotobox-secret'] || x.headers['x-fotobox-secret']!==$env.N8N_SHARED_SECRET) throw new Error('Unauthorized'); const id=Number(x.body?.leadId); if (!Number.isSafeInteger(id)||id<1) throw new Error('Invalid lead'); return [{json:{leadId:id}}];"},-400,220),
 httpget('Get Lead',"={{ 'http://api:4000/internal/leads/' + $('Verify Lead').item.json.leadId }}",-170,220),
 gmail('Email CS Event','={{ $env.CS_EMAIL }}',"={{ 'Lead B2B Era Snap: '+$('Get Lead').item.json.company }}","={{ 'Ada permintaan event baru!\\nPerusahaan: '+$('Get Lead').item.json.company+'\\nPIC: '+$('Get Lead').item.json.contact_name+'\\nEmail: '+$('Get Lead').item.json.email+'\\nHP: '+$('Get Lead').item.json.phone+'\\nJenis event: '+$('Get Lead').item.json.event_type+'\\nTanggal: '+$('Get Lead').item.json.event_date+'\\nCatatan: '+$('Get Lead').item.json.message }}",80,40),
 telegram('Telegram CS Event',"={{ '🎟️ Inquiry B2B: '+$('Get Lead').item.json.company+' | '+$('Get Lead').item.json.event_type+' | Lead #'+$('Get Lead').item.json.id+' — cek email CS untuk detail.' }}",80,220),
 sheets('Append B2B Leads','Leads_B2B',{'timestamp':'={{ $json.created_at }}','lead_id':'={{ $json.id }}','company':'={{ $json.company }}','contact_name':'={{ $json.contact_name }}','email':'={{ $json.email }}','phone':'={{ $json.phone }}','event_type':'={{ $json.event_type }}','event_date':'={{ $json.event_date }}','notes':'={{ $json.message }}'},80,420)]
workflow('Era Snap 02 - Event Leads / CS',w,{'Lead Webhook':['Verify Lead'],'Verify Lead':['Get Lead'],'Get Lead':['Email CS Event','Telegram CS Event','Append B2B Leads']},'02-b2b-leads.json')

w=[node('Daily Ops Trigger','scheduleTrigger',1.2,{'rule':{'interval':[{'field':'days','triggerAtHour':9,'triggerAtMinute':0}]}},-750,250),
 http_post('Ask Hermes for Ops Summary','http://api:4000/internal/ai/ops-summary',"={{ JSON.stringify({source:'daily-ops'}) }}",-500,250),
 telegram('Telegram Daily AI Summary',"={{ '🤖 Era Snap / Hermes daily review\\n\\n'+$json.summary }}",-240,100),
 node('OpenClaw Agent Hook','httpRequest',4.2,{'method':'POST','url':'={{ $env.OPENCLAW_HOOK_URL }}','sendHeaders':True,'headerParameters':{'parameters':[{'name':'Authorization','value':'={{ "Bearer " + $env.OPENCLAW_HOOK_TOKEN }}'}]},'sendBody':True,'specifyBody':'json','jsonBody':"={{ JSON.stringify({message:'Log operational insight for Era Snap based ONLY on anonymized summary: '+$('Ask Hermes for Ops Summary').item.json.summary,name:'Era Snap Daily Ops',sessionMode:'isolated'}) }}",'options':{}},-240,330)]
workflow('Era Snap 03 - Hermes + OpenClaw Daily Ops (Optional)',w,{'Daily Ops Trigger':['Ask Hermes for Ops Summary'],'Ask Hermes for Ops Summary':['Telegram Daily AI Summary','OpenClaw Agent Hook']},'03-agent-ops-optional.json')
print('Wrote',len(list(root.glob('*.json'))),'n8n workflows')
