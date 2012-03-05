class MethodDict(object):
    _instance = None
    _registry = {}
    
    def __new__(cls, *args, **kwargs):
        if cls != type(cls._instance):
            cls._instance = object.__new__(cls, *args, **kwargs)
        return cls._instance
    
    def register(self, name=None):
        def wrap(fn):
            def inner(*args, **kwargs):
                return fn(*args, **kwargs)
            self._registry[name or fn.func_name] = inner
            return inner
        return wrap
    
    def __getitem__(self, key):
        return self._registry[key]
    
    def keys(self):
        return self._registry.keys()
    
    def __setitem__(self, key, value):
        pass

Registry = MethodDict()