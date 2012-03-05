from registry import Registry
import json
from datetime import datetime
import time
from operator import itemgetter
import numpy as np

from pymongo import Connection
connection = Connection('localhost', 27017)
DB = connection.timeseries_data
Table = DB.DataStore

def rolling_window(a, window):
    shape = a.shape[:-1] + (a.shape[-1] - window + 1, window)   
    strides = a.strides + (a.strides[-1],)
    return np.lib.stride_tricks.as_strided(a, shape=shape, strides=strides)

def store_params(params):
    Table.insert({'type': 'params', 'value': params})
    
def store(data):
    res=[]
    params = get_params()
    for e in data:
        for k,v in e.items():
            k = k.replace('/', '_')
            if k=="timestamp":continue
            if not k in params:params.append(k)
            res.append({"timestamp":e["timestamp"], "name":k, "value":v})
    Table.insert(res)
    store_params(params)
    return True

@Registry.register()
def get(name, start_ts=0, num=None, **kwargs):
    res = [[e["value"], e["timestamp"]] for e in Table.find({"name":name, "timestamp":{"$gte":start_ts}}).sort("timestamp")]
    if num:res=res[:num]
    return res

@Registry.register()
def get_params(*args, **kwargs):
    t = Table.find_one({'type': 'params'})
    return t and t['value'] or []

@Registry.register('frequency')
def frequency_distribution(name, bins=0, *args, **kwargs):
    d = [e[0] for e in get(name)]
    npd = np.array(d)
    if not bins:
        bins = npd.max()*4.0
    res = np.histogram(npd, bins=bins)
    data = filter(lambda x: x[0] > 0, zip(list(res[0]), list(res[1][1:])))
    s=[[e[1]]*e[0] for e in data]
    s=[item for sublist in s for item in sublist]
    
    percentiles = [[np.percentile(s, e), e] for e in [25, 50, 90, 95, 99]]
    return [data, percentiles]

@Registry.register()
def sd(name, *args, **kwargs):
    d = get(name)
    return calculate_sd_snap(d)

@Registry.register()
def mean(name, *args, **kwargs):
    d = get(name)
    return calculate_mean_snap(d)

@Registry.register()
def sd_rolling(name, step, *args, **kwargs):
    d = get(name)
    step = int(step)
    return calculate_sd_rolling(d, step)

@Registry.register()
def mean_rolling(name,step, *args, **kwargs):
    d = get(name)
    step = int(step)
    return calculate_mean_rolling(d, step)

@Registry.register()
def dailychange(name, *args, **kwargs):
    d = get(name)
    data, ts = [e[0] for e in d], [e[1] for e in d]
    data = [x - data[i-1] if i else None for i, x in enumerate(data)][1:]
    return zip(data, ts[1:])

@Registry.register()
def ag_over_time(name, step, *args, **kwargs):
    d = get(name)
    step=int(step)
    data, ts = [e[0] for e in d], [e[1] for e in d]
    data = [ [sum(data[i*step: (i+1)*step]), ts[(i+1)*step-1]] for i in range(len(data)/float(step)) ]
    return data 

def calculate_mean_snap(data):
    d, ts = [e[0] for e in data], [e[1] for e in data]
    d = np.array(d)
    data = [[np.mean(d[:i]), ts[i-1]] for i in range(1,len(d)+1)]
    return data

def calculate_sd_snap(data):
    d, ts = [e[0] for e in data], [e[1] for e in data]
    d = np.array(d)
    data = [[np.std(d[:i]), ts[i-1]] for i in range(1,len(d)+1)]
    return data

def calculate_mean_rolling(data, step):
    data, ts = [e[0] for e in data], [e[1] for e in data]
    data = np.mean(rolling_window(np.array(data), step), -1)
    data = [[val, ts[index+step-1]] for (index, val) in enumerate(data)] 
    #data = [ [np.mean(np.array(data[i*step: (i+1)*step])), ts[(i+1)*step]] for i in range(len(data)/float(step)) ]
    return data 

def calculate_sd_rolling(data, step):
    data, ts = [e[0] for e in data], [e[1] for e in data]
    data = np.std(rolling_window(np.array(data), step), -1)
    data = [[val, ts[index+step-1]] for (index, val) in enumerate(data)] 
    #data = [ [np.std(np.array(data[i*step: (i+1)*step])), ts[(i+1)*step]] for i in range(len(data)/float(step)) ]
    return data