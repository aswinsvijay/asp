import json

file='./models/summary_model/tokenizer.json' # input your file path
data=json.load(open(file,'rb'))
# convert ['foo','bar'] into 'foo bar'
data['model']['merges']=[' '.join(i) for i in data['model']['merges']]
with open(file,'w',encoding='utf8') as f:
    json.dump(data,f,indent=2)