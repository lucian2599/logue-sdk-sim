var Module=typeof WABModule!=="undefined"?WABModule: {};
WABModule.manifest= {"header":{"platform":"prologue","module":"osc","api":"1.0-0","dev_id":0,"prg_id":0,"version":"1.3-0","name":"mo2va","num_param":3,"params":[["Detune",0,100,"%"],["Sync",0,100,"%"],["LFO Target",0,3,""]]}};
var moduleOverrides= {};
var key;
for(key in Module) {
    if(Module.hasOwnProperty(key)) {
        moduleOverrides[key]=Module[key]
    }
}
var arguments_=[];
var thisProgram="./this.program";
var quit_=function(status,toThrow) {
    throw toThrow
};
var ENVIRONMENT_IS_WEB=false;
var ENVIRONMENT_IS_WORKER=false;
var ENVIRONMENT_IS_NODE=false;
var ENVIRONMENT_HAS_NODE=false;
var ENVIRONMENT_IS_SHELL=false;
ENVIRONMENT_IS_WEB=typeof window==="object";
ENVIRONMENT_IS_WORKER=typeof importScripts==="function";
ENVIRONMENT_HAS_NODE=typeof process==="object"&&typeof process.versions==="object"&&typeof process.versions.node==="string";
ENVIRONMENT_IS_NODE=ENVIRONMENT_HAS_NODE&&!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_WORKER;
ENVIRONMENT_IS_SHELL=!ENVIRONMENT_IS_WEB&&!ENVIRONMENT_IS_NODE&&!ENVIRONMENT_IS_WORKER;
var scriptDirectory="";
function locateFile(path) {
    if(Module["locateFile"]) {
        return Module["locateFile"](path,scriptDirectory)
    }
    return scriptDirectory+path
}
var read_,readAsync,readBinary,setWindowTitle;
if(ENVIRONMENT_IS_NODE) {
    scriptDirectory=__dirname+"/";
    var nodeFS;
    var nodePath;
    read_=function shell_read(filename,binary) {
        var ret;
        ret=tryParseAsDataURI(filename);
        if(!ret) {
            if(!nodeFS)nodeFS=require("fs");
            if(!nodePath)nodePath=require("path");
            filename=nodePath["normalize"](filename);
            ret=nodeFS["readFileSync"](filename)
        }
        return binary?ret:ret.toString()
    };
    readBinary=function readBinary(filename) {
        var ret=read_(filename,true);
        if(!ret.buffer) {
            ret=new Uint8Array(ret)
        }
        assert(ret.buffer);
        return ret
    };
    if(process["argv"].length>1) {
        thisProgram=process["argv"][1].replace(/\\/g,"/")
    }
    arguments_=process["argv"].slice(2);
    if(typeof module!=="undefined") {
        module["exports"]=Module
    }
    process["on"]("uncaughtException",function(ex) {
        if(!(ex instanceof ExitStatus)) {
            throw ex
        }
    });
    process["on"]("unhandledRejection",abort);
    quit_=function(status) {
        process["exit"](status)
    };
    Module["inspect"]=function() {
        return"[Emscripten Module object]"
    }
}
else if(ENVIRONMENT_IS_SHELL) {
    if(typeof read!="undefined") {
        read_=function shell_read(f) {
            var data=tryParseAsDataURI(f);
            if(data) {
                return intArrayToString(data)
            }
            return read(f)
        }
    }
    readBinary=function readBinary(f) {
        var data;
        data=tryParseAsDataURI(f);
        if(data) {
            return data
        }
        if(typeof readbuffer==="function") {
            return new Uint8Array(readbuffer(f))
        }
        data=read(f,"binary");
        assert(typeof data==="object");
        return data
    };
    if(typeof scriptArgs!="undefined") {
        arguments_=scriptArgs
    }
    else if(typeof arguments!="undefined") {
        arguments_=arguments
    }
    if(typeof quit==="function") {
        quit_=function(status) {
            quit(status)
        }
    }
    if(typeof print!=="undefined") {
        if(typeof console==="undefined")console= {};
        console.log=print;
        console.warn=console.error=typeof printErr!=="undefined"?printErr:print
    }
}
else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER) {
    if(ENVIRONMENT_IS_WORKER) {
        scriptDirectory=self.location.href
    }
    else if(document.currentScript) {
        scriptDirectory=document.currentScript.src
    }
    if(scriptDirectory.indexOf("blob:")!==0) {
        scriptDirectory=scriptDirectory.substr(0,scriptDirectory.lastIndexOf("/")+1)
    }
    else {
        scriptDirectory=""
    }
    read_=function shell_read(url) {
        try {
            var xhr=new XMLHttpRequest;
            xhr.open("GET",url,false);
            xhr.send(null);
            return xhr.responseText
        }
        catch(err) {
            var data=tryParseAsDataURI(url);
            if(data) {
                return intArrayToString(data)
            }
            throw err
        }
    };
    if(ENVIRONMENT_IS_WORKER) {
        readBinary=function readBinary(url) {
            try {
                var xhr=new XMLHttpRequest;
                xhr.open("GET",url,false);
                xhr.responseType="arraybuffer";
                xhr.send(null);
                return new Uint8Array(xhr.response)
            }
            catch(err) {
                var data=tryParseAsDataURI(url);
                if(data) {
                    return data
                }
                throw err
            }
        }
    }
    readAsync=function readAsync(url,onload,onerror) {
        var xhr=new XMLHttpRequest;
        xhr.open("GET",url,true);
        xhr.responseType="arraybuffer";
        xhr.onload=function xhr_onload() {
            if(xhr.status==200||xhr.status==0&&xhr.response) {
                onload(xhr.response);
                return
            }
            var data=tryParseAsDataURI(url);
            if(data) {
                onload(data.buffer);
                return
            }
            onerror()
        };
        xhr.onerror=onerror;
        xhr.send(null)
    };
    setWindowTitle=function(title) {
        document.title=title
    }
}
else {} var out=Module["print"]||console.log.bind(console);
var err=Module["printErr"]||console.warn.bind(console);
for(key in moduleOverrides) {
    if(moduleOverrides.hasOwnProperty(key)) {
        Module[key]=moduleOverrides[key]
    }
}
moduleOverrides=null;
if(Module["arguments"])arguments_=Module["arguments"];
if(Module["thisProgram"])thisProgram=Module["thisProgram"];
if(Module["quit"])quit_=Module["quit"];
var STACK_ALIGN=16;
function dynamicAlloc(size) {
    var ret=HEAP32[DYNAMICTOP_PTR>>2];
    var end=ret+size+15&-16;
    if(end>_emscripten_get_heap_size()) {
        abort()
    }
    HEAP32[DYNAMICTOP_PTR>>2]=end;
    return ret
}
function getNativeTypeSize(type) {
    switch(type) {
    case"i1":
    case"i8":
        return 1;
    case"i16":
        return 2;
    case"i32":
        return 4;
    case"i64":
        return 8;
    case"float":
        return 4;
    case"double":
        return 8;
    default: {
        if(type[type.length-1]==="*") {
            return 4
        }
        else if(type[0]==="i") {
            var bits=parseInt(type.substr(1));
            assert(bits%8===0,"getNativeTypeSize invalid bits "+bits+", type "+type);
            return bits/8
        }
        else {
            return 0
        }
    }
    }
}
function warnOnce(text) {
    if(!warnOnce.shown)warnOnce.shown= {};
    if(!warnOnce.shown[text]) {
        warnOnce.shown[text]=1;
        err(text)
    }
}
var asm2wasmImports= {"f64-rem":function(x,y){return x%y},"debugger":function() {}};
var jsCallStartIndex=1;
var functionPointers=new Array(0);
function convertJsFunctionToWasm(func,sig) {
    var typeSection=[1,0,1,96];
    var sigRet=sig.slice(0,1);
    var sigParam=sig.slice(1);
    var typeCodes= {"i":127,"j":126,"f":125,"d":124};
    typeSection.push(sigParam.length);
    for(var i=0; i<sigParam.length; ++i) {
        typeSection.push(typeCodes[sigParam[i]])
    }
    if(sigRet=="v") {
        typeSection.push(0)
    }
    else {
        typeSection=typeSection.concat([1,typeCodes[sigRet]])
    }
    typeSection[1]=typeSection.length-2;
    var bytes=new Uint8Array([0,97,115,109,1,0,0,0].concat(typeSection,[2,7,1,1,101,1,102,0,0,7,5,1,1,102,0,0]));
    var module=new WebAssembly.Module(bytes);
    var instance=new WebAssembly.Instance(module, {e:{f:func}});
    var wrappedFunc=instance.exports.f;
    return wrappedFunc
}
var funcWrappers= {};
function dynCall(sig,ptr,args) {
    if(args&&args.length) {
        return Module["dynCall_"+sig].apply(null,[ptr].concat(args))
    }
    else {
        return Module["dynCall_"+sig].call(null,ptr)
    }
}
var tempRet0=0;
var setTempRet0=function(value) {
    tempRet0=value
};
var getTempRet0=function() {
    return tempRet0
};
var wasmBinary;
if(Module["wasmBinary"])wasmBinary=Module["wasmBinary"];
var noExitRuntime;
if(Module["noExitRuntime"])noExitRuntime=Module["noExitRuntime"];
if(typeof WebAssembly!=="object") {
    err("no native wasm support detected")
}
function setValue(ptr,value,type,noSafe) {
    type=type||"i8";
    if(type.charAt(type.length-1)==="*")type="i32";
    switch(type) {
    case"i1":
        HEAP8[ptr>>0]=value;
        break;
    case"i8":
        HEAP8[ptr>>0]=value;
        break;
    case"i16":
        HEAP16[ptr>>1]=value;
        break;
    case"i32":
        HEAP32[ptr>>2]=value;
        break;
    case"i64":
        tempI64=[value>>>0,(tempDouble=value,+Math_abs(tempDouble)>=1?tempDouble>0?(Math_min(+Math_floor(tempDouble/4294967296),4294967295)|0)>>>0:~~+Math_ceil((tempDouble-+(~~tempDouble>>>0))/4294967296)>>>0:0)],HEAP32[ptr>>2]=tempI64[0],HEAP32[ptr+4>>2]=tempI64[1];
        break;
    case"float":
        HEAPF32[ptr>>2]=value;
        break;
    case"double":
        HEAPF64[ptr>>3]=value;
        break;
    default:
        abort("invalid type for setValue: "+type)
    }
}
var wasmMemory;
var wasmTable;
var ABORT=false;
var EXITSTATUS=0;
function assert(condition,text) {
    if(!condition) {
        abort("Assertion failed: "+text)
    }
}
function getCFunc(ident) {
    var func=Module["_"+ident];
    assert(func,"Cannot call unknown function "+ident+", make sure it is exported");
    return func
}
function ccall(ident,returnType,argTypes,args,opts) {
    var toC= {"string":function(str){var ret=0; if(str!==null&&str!==undefined&&str!==0) {
            var len=(str.length<<2)+1;
            ret=stackAlloc(len);
            stringToUTF8(str,ret,len)
        } return ret
    },"array":function(arr) {
        var ret=stackAlloc(arr.length);
        writeArrayToMemory(arr,ret);
        return ret
    }
             };
    function convertReturnValue(ret) {
        if(returnType==="string")return UTF8ToString(ret);
        if(returnType==="boolean")return Boolean(ret);
        return ret
    }
    var func=getCFunc(ident);
    var cArgs=[];
    var stack=0;
    if(args) {
        for(var i=0; i<args.length; i++) {
            var converter=toC[argTypes[i]];
            if(converter) {
                if(stack===0)stack=stackSave();
                cArgs[i]=converter(args[i])
            }
            else {
                cArgs[i]=args[i]
            }
        }
    }
    var ret=func.apply(null,cArgs);
    ret=convertReturnValue(ret);
    if(stack!==0)stackRestore(stack);
    return ret
}
var ALLOC_NONE=3;
var UTF8Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf8"):undefined;
function UTF8ArrayToString(u8Array,idx,maxBytesToRead) {
    var endIdx=idx+maxBytesToRead;
    var endPtr=idx;
    while(u8Array[endPtr]&&!(endPtr>=endIdx))++endPtr;
    if(endPtr-idx>16&&u8Array.subarray&&UTF8Decoder) {
        return UTF8Decoder.decode(u8Array.subarray(idx,endPtr))
    }
    else {
        var str="";
        while(idx<endPtr) {
            var u0=u8Array[idx++];
            if(!(u0&128)) {
                str+=String.fromCharCode(u0);
                continue
            }
            var u1=u8Array[idx++]&63;
            if((u0&224)==192) {
                str+=String.fromCharCode((u0&31)<<6|u1);
                continue
            }
            var u2=u8Array[idx++]&63;
            if((u0&240)==224) {
                u0=(u0&15)<<12|u1<<6|u2
            }
            else {
                u0=(u0&7)<<18|u1<<12|u2<<6|u8Array[idx++]&63
            }
            if(u0<65536) {
                str+=String.fromCharCode(u0)
            }
            else {
                var ch=u0-65536;
                str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)
            }
        }
    }
    return str
}
function UTF8ToString(ptr,maxBytesToRead) {
    return ptr?UTF8ArrayToString(HEAPU8,ptr,maxBytesToRead):""
}
function stringToUTF8Array(str,outU8Array,outIdx,maxBytesToWrite) {
    if(!(maxBytesToWrite>0))return 0;
    var startIdx=outIdx;
    var endIdx=outIdx+maxBytesToWrite-1;
    for(var i=0; i<str.length; ++i) {
        var u=str.charCodeAt(i);
        if(u>=55296&&u<=57343) {
            var u1=str.charCodeAt(++i);
            u=65536+((u&1023)<<10)|u1&1023
        }
        if(u<=127) {
            if(outIdx>=endIdx)break;
            outU8Array[outIdx++]=u
        }
        else if(u<=2047) {
            if(outIdx+1>=endIdx)break;
            outU8Array[outIdx++]=192|u>>6;
            outU8Array[outIdx++]=128|u&63
        }
        else if(u<=65535) {
            if(outIdx+2>=endIdx)break;
            outU8Array[outIdx++]=224|u>>12;
            outU8Array[outIdx++]=128|u>>6&63;
            outU8Array[outIdx++]=128|u&63
        }
        else {
            if(outIdx+3>=endIdx)break;
            outU8Array[outIdx++]=240|u>>18;
            outU8Array[outIdx++]=128|u>>12&63;
            outU8Array[outIdx++]=128|u>>6&63;
            outU8Array[outIdx++]=128|u&63
        }
    }
    outU8Array[outIdx]=0;
    return outIdx-startIdx
}
function stringToUTF8(str,outPtr,maxBytesToWrite) {
    return stringToUTF8Array(str,HEAPU8,outPtr,maxBytesToWrite)
}
function lengthBytesUTF8(str) {
    var len=0;
    for(var i=0; i<str.length; ++i) {
        var u=str.charCodeAt(i);
        if(u>=55296&&u<=57343)u=65536+((u&1023)<<10)|str.charCodeAt(++i)&1023;
        if(u<=127)++len;
        else if(u<=2047)len+=2;
        else if(u<=65535)len+=3;
        else len+=4
        }
    return len
}
var UTF16Decoder=typeof TextDecoder!=="undefined"?new TextDecoder("utf-16le"):undefined;
function writeArrayToMemory(array,buffer) {
    HEAP8.set(array,buffer)
}
function writeAsciiToMemory(str,buffer,dontAddNull) {
    for(var i=0; i<str.length; ++i) {
        HEAP8[buffer++>>0]=str.charCodeAt(i)
    }
    if(!dontAddNull)HEAP8[buffer>>0]=0
    }
var WASM_PAGE_SIZE=65536;
function alignUp(x,multiple) {
    if(x%multiple>0) {
        x+=multiple-x%multiple
    }
    return x
}
var buffer,HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAPF64;
function updateGlobalBufferAndViews(buf) {
    buffer=buf;
    Module["HEAP8"]=HEAP8=new Int8Array(buf);
    Module["HEAP16"]=HEAP16=new Int16Array(buf);
    Module["HEAP32"]=HEAP32=new Int32Array(buf);
    Module["HEAPU8"]=HEAPU8=new Uint8Array(buf);
    Module["HEAPU16"]=HEAPU16=new Uint16Array(buf);
    Module["HEAPU32"]=HEAPU32=new Uint32Array(buf);
    Module["HEAPF32"]=HEAPF32=new Float32Array(buf);
    Module["HEAPF64"]=HEAPF64=new Float64Array(buf)
}
var STACK_BASE=20992,DYNAMIC_BASE=5263872,DYNAMICTOP_PTR=20960;
var INITIAL_TOTAL_MEMORY=Module["TOTAL_MEMORY"]||16777216;
if(Module["wasmMemory"]) {
    wasmMemory=Module["wasmMemory"]
}
else {
    wasmMemory=new WebAssembly.Memory({"initial":INITIAL_TOTAL_MEMORY/WASM_PAGE_SIZE})
}
if(wasmMemory) {
    buffer=wasmMemory.buffer
}
INITIAL_TOTAL_MEMORY=buffer.byteLength;
updateGlobalBufferAndViews(buffer);
HEAP32[DYNAMICTOP_PTR>>2]=DYNAMIC_BASE;
function callRuntimeCallbacks(callbacks) {
    while(callbacks.length>0) {
        var callback=callbacks.shift();
        if(typeof callback=="function") {
            callback();
            continue
        }
        var func=callback.func;
        if(typeof func==="number") {
            if(callback.arg===undefined) {
                Module["dynCall_v"](func)
            }
            else {
                Module["dynCall_vi"](func,callback.arg)
            }
        }
        else {
            func(callback.arg===undefined?null:callback.arg)
        }
    }
}
var __ATPRERUN__=[];
var __ATINIT__=[];
var __ATMAIN__=[];
var __ATPOSTRUN__=[];
var runtimeInitialized=false;
var runtimeExited=false;
function preRun() {
    if(Module["preRun"]) {
        if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];
        while(Module["preRun"].length) {
            addOnPreRun(Module["preRun"].shift())
        }
    }
    callRuntimeCallbacks(__ATPRERUN__)
}
function initRuntime() {
    runtimeInitialized=true;
    callRuntimeCallbacks(__ATINIT__)
}
function preMain() {
    callRuntimeCallbacks(__ATMAIN__)
}
function exitRuntime() {
    runtimeExited=true
}
function postRun() {
    if(Module["postRun"]) {
        if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];
        while(Module["postRun"].length) {
            addOnPostRun(Module["postRun"].shift())
        }
    }
    callRuntimeCallbacks(__ATPOSTRUN__)
}
function addOnPreRun(cb) {
    __ATPRERUN__.unshift(cb)
}
function addOnPostRun(cb) {
    __ATPOSTRUN__.unshift(cb)
}
var Math_abs=Math.abs;
var Math_ceil=Math.ceil;
var Math_floor=Math.floor;
var Math_min=Math.min;
var runDependencies=0;
var runDependencyWatcher=null;
var dependenciesFulfilled=null;
function addRunDependency(id) {
    runDependencies++;
    if(Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies)
    }
}
function removeRunDependency(id) {
    runDependencies--;
    if(Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies)
    }
    if(runDependencies==0) {
        if(runDependencyWatcher!==null) {
            clearInterval(runDependencyWatcher);
            runDependencyWatcher=null
        }
        if(dependenciesFulfilled) {
            var callback=dependenciesFulfilled;
            dependenciesFulfilled=null;
            callback()
        }
    }
}
Module["preloadedImages"]= {};
Module["preloadedAudios"]= {};
var dataURIPrefix="data:application/octet-stream;base64,";
function isDataURI(filename) {
    return String.prototype.startsWith?filename.startsWith(dataURIPrefix):filename.indexOf(dataURIPrefix)===0
}
var wasmBinaryFile="data:application/octet-stream;base64,AGFzbQEAAAAByQEbYAF/AGAEf39/fwBgBH9/f38Bf2ADf398AGAGf39/f39/AGABfwF/YAAAYAV/f39/fwBgAn9/AX9gA39/fwF/YAV/f39/fwF/YAZ/f39/f38Bf2ACf38AYAR/f398AGANf39/f39/f39/f39/fwBgCH9/f39/f39/AGADf39/AGADf39/AXxgAAF/YAd/fX19fX9/AGAGf319fX9/AGABfQF9YAABfWABfQF/YAd/f39/f39/AX9gBX9/f398AGAHf39/f39/fwAC+wUdA2VudgVhYm9ydAAAA2VudgtfX19zZXRFcnJObwAAA2VudhZfX2VtYmluZF9yZWdpc3Rlcl9ib29sAAcDZW52F19fZW1iaW5kX3JlZ2lzdGVyX2NsYXNzAA4DZW52IF9fZW1iaW5kX3JlZ2lzdGVyX2NsYXNzX2Z1bmN0aW9uAA8DZW52F19fZW1iaW5kX3JlZ2lzdGVyX2VtdmFsAAwDZW52F19fZW1iaW5kX3JlZ2lzdGVyX2Zsb2F0ABADZW52Gl9fZW1iaW5kX3JlZ2lzdGVyX2Z1bmN0aW9uAAQDZW52GV9fZW1iaW5kX3JlZ2lzdGVyX2ludGVnZXIABwNlbnYdX19lbWJpbmRfcmVnaXN0ZXJfbWVtb3J5X3ZpZXcAEANlbnYcX19lbWJpbmRfcmVnaXN0ZXJfc3RkX3N0cmluZwAMA2Vudh1fX2VtYmluZF9yZWdpc3Rlcl9zdGRfd3N0cmluZwAQA2VudhZfX2VtYmluZF9yZWdpc3Rlcl92b2lkAAwDZW52Cl9fZW12YWxfYXMAEQNlbnYOX19lbXZhbF9kZWNyZWYAAANlbnYUX19lbXZhbF9nZXRfcHJvcGVydHkACANlbnYOX19lbXZhbF9pbmNyZWYAAANlbnYTX19lbXZhbF9uZXdfY3N0cmluZwAFA2VudhdfX2VtdmFsX3J1bl9kZXN0cnVjdG9ycwAAA2VudhJfX2VtdmFsX3Rha2VfdmFsdWUACANlbnYGX2Fib3J0AAYDZW52GV9lbXNjcmlwdGVuX2dldF9oZWFwX3NpemUAEgNlbnYWX2Vtc2NyaXB0ZW5fbWVtY3B5X2JpZwAJA2VudhdfZW1zY3JpcHRlbl9yZXNpemVfaGVhcAAFA2VudhdhYm9ydE9uQ2Fubm90R3Jvd01lbW9yeQAFA2VudgxfX3RhYmxlX2Jhc2UDfwADZW52DkRZTkFNSUNUT1BfUFRSA38AA2VudgZtZW1vcnkCAIACA2VudgV0YWJsZQFwAVtbA4MBgQEFBgUSAAwAAQACAwEGBQUABQQGCg0HCwgFBRAMAAAMDAQTFBUVFRISFgYSCAgFFwYGBgYGBgYGBgYGBgYAAAAAAAAGBgYGBgUFCAUACQQHAQkQEAEIBAcBCQkICAgEBwEBBAcJCQUJAgoLGAAMEA0ZBwQaBQgJAgoLBgAMAw0BBwQGEAJ/AUGApAELfwFBgKTBAgsHkgUpEF9fZ3Jvd1dhc21NZW1vcnkAGRJfX1oxMmNyZWF0ZU1vZHVsZWkAKStfX19lbWJpbmRfcmVnaXN0ZXJfbmF0aXZlX2FuZF9idWlsdGluX3R5cGVzAEgRX19fZXJybm9fbG9jYXRpb24AQw5fX19nZXRUeXBlTmFtZQBgDF9faG9va19jeWNsZQAzC19faG9va19pbml0ADQKX19ob29rX29mZgA1CV9faG9va19vbgA2DF9faG9va19wYXJhbQA3EF9fb3NjX2JsX3Bhcl9pZHgAPBBfX29zY19ibF9zYXdfaWR4AD0QX19vc2NfYmxfc3FyX2lkeAA+Dl9fb3NjX21jdV9oYXNoAD8KX19vc2NfcmFuZABAC19fb3NjX3doaXRlAEEFX2ZyZWUAZAdfbWFsbG9jAGMHX21lbWNweQB8B19tZW1zZXQAfQ1fb3NjX2FwaV9pbml0AEIFX3NicmsAfgpkeW5DYWxsX2lpADALZHluQ2FsbF9paWkAfwxkeW5DYWxsX2lpaWkAgAENZHluQ2FsbF9paWlpaQCBAQ5keW5DYWxsX2lpaWlpaQCCAQ9keW5DYWxsX2lpaWlpaWkAgwEJZHluQ2FsbF92AIQBCmR5bkNhbGxfdmkAhQELZHluQ2FsbF92aWkAhgEMZHluQ2FsbF92aWlkAIcBDWR5bkNhbGxfdmlpaWQAiAENZHluQ2FsbF92aWlpaQCJAQ5keW5DYWxsX3ZpaWlpaQCKAQ9keW5DYWxsX3ZpaWlpaWkAiwETZXN0YWJsaXNoU3RhY2tTcGFjZQAeC2dsb2JhbEN0b3JzABoKc3RhY2tBbGxvYwAbDHN0YWNrUmVzdG9yZQAdCXN0YWNrU2F2ZQAcCYkBAQAjAAtb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AzYCACACQQxqIAE2AgAgAkEYakEANgIACwVBrJYBIAQgBXI2AgAgACACNgIAIAJBGGogADYCACACQQxqIAI2AgAgAkEIaiACNgIAC0HIlgFByJYBKAIAQX9qIgA2AgAgAARADwtB8JkBIQADQCAAKAIAIgFBCGohACABDQALQciWAUF/NgIAC+YBAQN/IwIhBSMCQUBrJAIgBSEDIAAgAUEAEGkEf0EBBSABBH8gAUG4HBBtIgEEfyADIAE2AgAgA0EEakEANgIAIANBCGogADYCACADQQxqQX82AgAgA0EQaiIEQgA3AgAgBEIANwIIIARCADcCECAEQgA3AhggBEEANgIgIARBADsBJCAEQQA6ACYgA0EwakEBNgIAIAEoAgBBHGooAgAhACABIAMgAigCAEEBIABBB3FBwwBqEQEAIANBGGooAgBBAUYEfyACIAQoAgA2AgBBAQVBAAsFQQALBUEACwshACAFJAIgAAsdACAAIAFBCGooAgAgBRBpBEAgASACIAMgBBBsCwuyAQAgACABQQhqKAIAIAQQaQRAIAEgAiADEGsFIAAgASgCACAEEGkEQAJAIAFBEGooAgAgAkcEQCABQRRqIgAoAgAgAkcEQCABQSBqIAM2AgAgACACNgIAIAFBKGoiACAAKAIAQQFqNgIAIAFBJGooAgBBAUYEQCABQRhqKAIAQQJGBEAgAUE2akEBOgAACwsgAUEsakEENgIADAILCyADQQFGBEAgAUEgakEBNgIACwsLCwsbACAAIAFBCGooAgBBABBpBEAgASACIAMQagsLIAAgAgR/IABBBGooAgAgAUEEaigCABBERQUgACABRgsLbQECfyAAQRBqIgMoAgAiBARAAkAgASAERwRAIABBJGoiAyADKAIAQQFqNgIAIABBAjYCGCAAQQE6ADYMAQsgAEEYaiIDKAIAQQJGBEAgAyACNgIACwsFIAMgATYCACAAIAI2AhggAEEBNgIkCwskACABIAAoAgRGBEAgAEEcaiIAKAIAQQFHBEAgACACNgIACwsLuAEBAX8gAEEBOgA1IAIgACgCBEYEQAJAIABBAToANCAAQRBqIgQoAgAiAkUEQCAEIAE2AgAgACADNgIYIABBATYCJCAAKAIwQQFGIANBAUZxRQ0BIABBAToANgwBCyABIAJHBEAgAEEkaiIEIAQoAgBB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TT9ATVE/ONtUP1pIWD8hlFs/Br5eP5PFYT9UqmQ/02tnP6sJaj9mg2w/odhuPwcJcT9EFHM/Bfp0Pwa6dj/0U3g/m8d5P7oUez8uO3w/tDp9PysTfj9yxH4/Zk5/Pwexfz9G7H8/AACAPwAAAAA4DgAABQAAAAYAAAAHAAAACAAAAAEAAAADAAAAAQAAAAMAAAAAAAAAYA4AAAUAAAAJAAAABwAAAAgAAAABAAAABAAAAAIAAAAEAAAAAAAAALAOAAAFAAAACgAAAAcAAAAIAAAAAgAAAAAAAACADgAABQAAAAsAAAAHAAAACAAAAAMAAAAAAAAAMA8AAAUAAAAMAAAABwAAAAgAAAABAAAABQAAAAMAAAAFAAAATjRLT1JHMTRMb2d1ZVByb2Nlc3NvckUATjRLT1JHMTVMb2d1ZU9zY2lsbGF0b3JFAGlpAExvZ3VlUHJvY2Vzc29yAHZpAExvZ3VlT3NjaWxsYXRvcgBMb2d1ZUVmZmVjdABQS040S09SRzExTG9ndWVFZmZlY3RFAFBONEtPUkcxMUxvZ3VlRWZmZWN0RQBONEtPUkcxMUxvZ3VlRWZmZWN0RQBQS040S09SRzE1TG9ndWVPc2NpbGxhdG9yRQBQTjRLT1JHMTVMb2d1ZU9zY2lsbGF0b3JFAFBLTjRLT1JHMTRMb2d1ZVByb2Nlc3NvckUAUE40S09SRzE0TG9ndWVQcm9jZXNzb3JFAHNldABOU3QzX18yMTJiYXNpY19zdHJpbmdJY05TXzExY2hhcl90cmFpdHNJY0VFTlNfOWFsbG9jYXRvckljRUVFRQBOU3QzX18yMjFfX2Jhc2ljX3N0cmluZ19jb21tb25JTGIxRUVFAE4zV0FCOVByb2Nlc3NvckUAdgBQcm9jZXNzb3IAaW5pdABpaWlpaWkAc2V0UGFyYW0AdmlpaWQAcHJvY2VzcwB2aWlpaWkAb25tZXNzYWdlAGlpaWlpaWkAZ2V0SW5zdGFuY2UAaWlpAE4xMGVtc2NyaXB0ZW4zdmFsRQBQS04zV0FCOVByb2Nlc3NvckUAUE4zV0FCOVByb2Nlc3NvckUAbGVuZ3RoAE42cGxhaXRzMTlWaXJ0dWFsQW5hbG9nRW5naW5lRQBONnBsYWl0czZFbmdpbmVFAHZvaWQAYm9vbABjaGFyAHNpZ25lZCBjaGFyAHVuc2lnbmVkIGNoYXIAc2hvcnQAdW5zaWduZWQgc2hvcnQAaW50AHVuc2lnbmVkIGludABsb25nAHVuc2lnbmVkIGxvbmcAZmxvYXQAZG91YmxlAHN0ZDo6c3RyaW5nAHN0ZDo6YmFzaWNfc3RyaW5nPHVuc2lnbmVkIGNoYXI+AHN0ZDo6d3N0cmluZwBlbXNjcmlwdGVuOjp2YWwAZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8Y2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8c2lnbmVkIGNoYXI+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGNoYXI+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHNob3J0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBzaG9ydD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBpbnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGxvbmc+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGxvbmc+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDhfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDhfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50MTZfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDE2X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDMyX3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxmbG9hdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8ZG91YmxlPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxsb25nIGRvdWJsZT4ATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJZUVFAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWRFRQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lmRUUATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJbUVFAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWxFRQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lqRUUATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJaUVFAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SXRFRQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lzRUUATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJaEVFAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWFFRQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0ljRUUATlN0M19fMjEyYmFzaWNfc3RyaW5nSXdOU18xMWNoYXJfdHJhaXRzSXdFRU5TXzlhbGxvY2F0b3JJd0VFRUUATlN0M19fMjEyYmFzaWNfc3RyaW5nSWhOU18xMWNoYXJfdHJhaXRzSWhFRU5TXzlhbGxvY2F0b3JJaEVFRUUATjEwX19jeHhhYml2MTE2X19zaGltX3R5cGVfaW5mb0UAU3Q5dHlwZV9pbmZvAE4xMF9fY3h4YWJpdjEyMF9fc2lfY2xhc3NfdHlwZV9pbmZvRQBOMTBfX2N4eGFiaXYxMTdfX2NsYXNzX3R5cGVfaW5mb0UATjEwX19jeHhhYml2MTE3X19wYmFzZV90eXBlX2luZm9FAE4xMF9fY3h4YWJpdjExOV9fcG9pbnRlcl90eXBlX2luZm9FAE4xMF9fY3h4YWJpdjEyMF9fZnVuY3Rpb25fdHlwZV9pbmZvRQBOMTBfX2N4eGFiaXYxMjlfX3BvaW50ZXJfdG9fbWVtYmVyX3R5cGVfaW5mb0UATjEwX19jeHhhYml2MTIzX19mdW5kYW1lbnRhbF90eXBlX2luZm9FAHYARG4AYgBjAGgAYQBzAHQAaQBqAGwAbQBmAGQATjEwX19jeHhhYml2MTIxX192bWlfY2xhc3NfdHlwZV9pbmZvRQ==";
if(!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile=locateFile(wasmBinaryFile)
}
function getBinary() {
    try {
        if(wasmBinary) {
            return new Uint8Array(wasmBinary)
        }
        var binary=tryParseAsDataURI(wasmBinaryFile);
        if(binary) {
            return binary
        }
        if(readBinary) {
            return readBinary(wasmBinaryFile)
        }
        else {
            throw"sync fetching of the wasm failed: you can preload it to Module['wasmBinary'] manually, or emcc.py will do that for you when generating HTML (but not JS)"
        }
    }
    catch(err) {
        abort(err)
    }
}
function getBinaryPromise() {
    if(!wasmBinary&&(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER)&&typeof fetch==="function") {
        return fetch(wasmBinaryFile, {credentials:"same-origin"}).then(function(response) {
            if(!response["ok"]) {
                throw"failed to load wasm binary file at '"+wasmBinaryFile+"'"
            }
            return response["arrayBuffer"]()
        }).catch(function() {
            return getBinary()
        })
    }
    return new Promise(function(resolve,reject) {
        resolve(getBinary())
    })
}
function createWasm(env) {
    var info= {"env":env,"wasi_unstable":env,"global":{"NaN":NaN,Infinity:Infinity},"global.Math":Math,"asm2wasm":asm2wasmImports};
    function receiveInstance(instance,module) {
        var exports=instance.exports;
        Module["asm"]=exports;
        removeRunDependency("wasm-instantiate")
    }
    addRunDependency("wasm-instantiate");
    function instantiateSync() {
        var instance;
        var module;
        var binary;
        try {
            binary=getBinary();
            module=new WebAssembly.Module(binary);
            instance=new WebAssembly.Instance(module,info)
        }
        catch(e) {
            var str=e.toString();
            err("failed to compile wasm module: "+str);
            if(str.indexOf("imported Memory")>=0||str.indexOf("memory import")>=0) {
                err("Memory size incompatibility issues may be due to changing TOTAL_MEMORY at runtime to something too large. Use ALLOW_MEMORY_GROWTH to allow any size memory (and also make sure not to set TOTAL_MEMORY at runtime to something smaller than it was at compile time).")
            }
            throw e
        }
        receiveInstance(instance,module)
    }
    if(Module["instantiateWasm"]) {
        try {
            var exports=Module["instantiateWasm"](info,receiveInstance);
            return exports
        }
        catch(e) {
            err("Module.instantiateWasm callback failed with error: "+e);
            return false
        }
    }
    instantiateSync();
    return Module["asm"]
}
Module["asm"]=function(global,env,providedBuffer) {
    env["memory"]=wasmMemory;
    env["table"]=wasmTable=new WebAssembly.Table({"initial":91,"maximum":91,"element":"anyfunc"});
    env["__memory_base"]=1024;
    env["__table_base"]=0;
    var exports=createWasm(env);
    return exports
};
var tempDouble;
var tempI64;
__ATINIT__.push({func:function() {
    globalCtors()
}});
var tempDoublePtr=20976;
function demangle(func) {
    return func
}
function demangleAll(text) {
    var regex=/\b__Z[\w\d_]+/g;
    return text.replace(regex,function(x) {
        var y=demangle(x);
        return x===y?x:y+" ["+x+"]"
    })
}
function jsStackTrace() {
    var err=new Error;
    if(!err.stack) {
        try {
            throw new Error(0)
        }
        catch(e) {
            err=e
        }
        if(!err.stack) {
            return"(no stack trace available)"
        }
    }
    return err.stack.toString()
}
function stackTrace() {
    var js=jsStackTrace();
    if(Module["extraStackTrace"])js+="\n"+Module["extraStackTrace"]();
    return demangleAll(js)
}
function ___gxx_personality_v0() {} function getShiftFromSize(size) {
    switch(size) {
    case 1:
        return 0;
    case 2:
        return 1;
    case 4:
        return 2;
    case 8:
        return 3;
    default:
        throw new TypeError("Unknown type size: "+size)
    }
}
function embind_init_charCodes() {
    var codes=new Array(256);
    for(var i=0; i<256; ++i) {
        codes[i]=String.fromCharCode(i)
    }
    embind_charCodes=codes
}
var embind_charCodes=undefined;
function readLatin1String(ptr) {
    var ret="";
    var c=ptr;
    while(HEAPU8[c]) {
        ret+=embind_charCodes[HEAPU8[c++]]
    }
    return ret
}
var awaitingDependencies= {};
var registeredTypes= {};
var typeDependencies= {};
var char_0=48;
var char_9=57;
function makeLegalFunctionName(name) {
    if(undefined===name) {
        return"_unknown"
    }
    name=name.replace(/[^a-zA-Z0-9_]/g,"$");
    var f=name.charCodeAt(0);
    if(f>=char_0&&f<=char_9) {
        return"_"+name
    }
    else {
        return name
    }
}
function createNamedFunction(name,body) {
    name=makeLegalFunctionName(name);
    return new Function("body","return function "+name+"() {\n"+'    "use strict";'+"    return body.apply(this, arguments);\n"+"};\n")(body)
}
function extendError(baseErrorType,errorName) {
    var errorClass=createNamedFunction(errorName,function(message) {
        this.name=errorName;
        this.message=message;
        var stack=new Error(message).stack;
        if(stack!==undefined) {
            this.stack=this.toString()+"\n"+stack.replace(/^Error(:[^\n]*)?\n/,"")
        }
    });
    errorClass.prototype=Object.create(baseErrorType.prototype);
    errorClass.prototype.constructor=errorClass;
    errorClass.prototype.toString=function() {
        if(this.message===undefined) {
            return this.name
        }
        else {
            return this.name+": "+this.message
        }
    };
    return errorClass
}
var BindingError=undefined;
function throwBindingError(message) {
    throw new BindingError(message)
}
var InternalError=undefined;
function throwInternalError(message) {
    throw new InternalError(message)
}
function whenDependentTypesAreResolved(myTypes,dependentTypes,getTypeConverters) {
    myTypes.forEach(function(type) {
        typeDependencies[type]=dependentTypes
    });
    function onComplete(typeConverters) {
        var myTypeConverters=getTypeConverters(typeConverters);
        if(myTypeConverters.length!==myTypes.length) {
            throwInternalError("Mismatched type converter count")
        }
        for(var i=0; i<myTypes.length; ++i) {
            registerType(myTypes[i],myTypeConverters[i])
        }
    }
    var typeConverters=new Array(dependentTypes.length);
    var unregisteredTypes=[];
    var registered=0;
    dependentTypes.forEach(function(dt,i) {
        if(registeredTypes.hasOwnProperty(dt)) {
            typeConverters[i]=registeredTypes[dt]
        }
        else {
            unregisteredTypes.push(dt);
            if(!awaitingDependencies.hasOwnProperty(dt)) {
                awaitingDependencies[dt]=[]
            }
            awaitingDependencies[dt].push(function() {
                typeConverters[i]=registeredTypes[dt];
                ++registered;
                if(registered===unregisteredTypes.length) {
                    onComplete(typeConverters)
                }
            })
        }
    });
    if(0===unregisteredTypes.length) {
        onComplete(typeConverters)
    }
}
function registerType(rawType,registeredInstance,options) {
    options=options|| {};
    if(!("argPackAdvance"in registeredInstance)) {
        throw new TypeError("registerType registeredInstance requires argPackAdvance")
    }
    var name=registeredInstance.name;
    if(!rawType) {
        throwBindingError('type "'+name+'" must have a positive integer typeid pointer')
    }
    if(registeredTypes.hasOwnProperty(rawType)) {
        if(options.ignoreDuplicateRegistrations) {
            return
        }
        else {
            throwBindingError("Cannot register type '"+name+"' twice")
        }
    }
    registeredTypes[rawType]=registeredInstance;
    delete typeDependencies[rawType];
    if(awaitingDependencies.hasOwnProperty(rawType)) {
        var callbacks=awaitingDependencies[rawType];
        delete awaitingDependencies[rawType];
        callbacks.forEach(function(cb) {
            cb()
        })
    }
}
function __embind_register_bool(rawType,name,size,trueValue,falseValue) {
    var shift=getShiftFromSize(size);
    name=readLatin1String(name);
    registerType(rawType, {name:name,"fromWireType":function(wt) {
        return!!wt
    },"toWireType":function(destructors,o) {
        return o?trueValue:falseValue
    },"argPackAdvance":8,"readValueFromPointer":function(pointer) {
        var heap;
        if(size===1) {
            heap=HEAP8
        }
        else if(size===2) {
            heap=HEAP16
        }
        else if(size===4) {
            heap=HEAP32
        }
        else {
            throw new TypeError("Unknown boolean type size: "+name)
        }
        return this["fromWireType"](heap[pointer>>shift])
    },destructorFunction:null
                          })
}
function ClassHandle_isAliasOf(other) {
    if(!(this instanceof ClassHandle)) {
        return false
    }
    if(!(other instanceof ClassHandle)) {
        return false
    }
    var leftClass=this.$$.ptrType.registeredClass;
    var left=this.$$.ptr;
    var rightClass=other.$$.ptrType.registeredClass;
    var right=other.$$.ptr;
    while(leftClass.baseClass) {
        left=leftClass.upcast(left);
        leftClass=leftClass.baseClass
    }
    while(rightClass.baseClass) {
        right=rightClass.upcast(right);
        rightClass=rightClass.baseClass
    }
    return leftClass===rightClass&&left===right
}
function shallowCopyInternalPointer(o) {
    return{count:o.count,deleteScheduled:o.deleteScheduled,preservePointerOnDelete:o.preservePointerOnDelete,ptr:o.ptr,ptrType:o.ptrType,smartPtr:o.smartPtr,smartPtrType:o.smartPtrType}
}
function throwInstanceAlreadyDeleted(obj) {
    function getInstanceTypeName(handle) {
        return handle.$$.ptrType.registeredClass.name
    }
    throwBindingError(getInstanceTypeName(obj)+" instance already deleted")
}
var finalizationGroup=false;
function detachFinalizer(handle) {} function runDestructor($$) {
    if($$.smartPtr) {
        $$.smartPtrType.rawDestructor($$.smartPtr)
    }
    else {
        $$.ptrType.registeredClass.rawDestructor($$.ptr)
    }
}
function releaseClassHandle($$) {
    $$.count.value-=1;
    var toDelete=0===$$.count.value;
    if(toDelete) {
        runDestructor($$)
    }
}
function attachFinalizer(handle) {
    if("undefined"===typeof FinalizationGroup) {
        attachFinalizer=function(handle) {
            return handle
        };
        return handle
    }
    finalizationGroup=new FinalizationGroup(function(iter) {
        for(var result=iter.next(); !result.done; result=iter.next()) {
            var $$=result.value;
            if(!$$.ptr) {
                console.warn("object already deleted: "+$$.ptr)
            }
            else {
                releaseClassHandle($$)
            }
        }
    });
    attachFinalizer=function(handle) {
        finalizationGroup.register(handle,handle.$$,handle.$$);
        return handle
    };
    detachFinalizer=function(handle) {
        finalizationGroup.unregister(handle.$$)
    };
    return attachFinalizer(handle)
}
function ClassHandle_clone() {
    if(!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this)
    }
    if(this.$$.preservePointerOnDelete) {
        this.$$.count.value+=1;
        return this
    }
    else {
        var clone=attachFinalizer(Object.create(Object.getPrototypeOf(this), {$$:{value:shallowCopyInternalPointer(this.$$)}}));
        clone.$$.count.value+=1;
        clone.$$.deleteScheduled=false;
        return clone
    }
}
function ClassHandle_delete() {
    if(!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this)
    }
    if(this.$$.deleteScheduled&&!this.$$.preservePointerOnDelete) {
        throwBindingError("Object already scheduled for deletion")
    }
    detachFinalizer(this);
    releaseClassHandle(this.$$);
    if(!this.$$.preservePointerOnDelete) {
        this.$$.smartPtr=undefined;
        this.$$.ptr=undefined
    }
}
function ClassHandle_isDeleted() {
    return!this.$$.ptr
}
var delayFunction=undefined;
var deletionQueue=[];
function flushPendingDeletes() {
    while(deletionQueue.length) {
        var obj=deletionQueue.pop();
        obj.$$.deleteScheduled=false;
        obj["delete"]()
    }
}
function ClassHandle_deleteLater() {
    if(!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this)
    }
    if(this.$$.deleteScheduled&&!this.$$.preservePointerOnDelete) {
        throwBindingError("Object already scheduled for deletion")
    }
    deletionQueue.push(this);
    if(deletionQueue.length===1&&delayFunction) {
        delayFunction(flushPendingDeletes)
    }
    this.$$.deleteScheduled=true;
    return this
}
function init_ClassHandle() {
    ClassHandle.prototype["isAliasOf"]=ClassHandle_isAliasOf;
    ClassHandle.prototype["clone"]=ClassHandle_clone;
    ClassHandle.prototype["delete"]=ClassHandle_delete;
    ClassHandle.prototype["isDeleted"]=ClassHandle_isDeleted;
    ClassHandle.prototype["deleteLater"]=ClassHandle_deleteLater
}
function ClassHandle() {} var registeredPointers= {};
function ensureOverloadTable(proto,methodName,humanName) {
    if(undefined===proto[methodName].overloadTable) {
        var prevFunc=proto[methodName];
        proto[methodName]=function() {
            if(!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
                throwBindingError("Function '"+humanName+"' called with an invalid number of arguments ("+arguments.length+") - expects one of ("+proto[methodName].overloadTable+")!")
            }
            return proto[methodName].overloadTable[arguments.length].apply(this,arguments)
        };
        proto[methodName].overloadTable=[];
        proto[methodName].overloadTable[prevFunc.argCount]=prevFunc
    }
}
function exposePublicSymbol(name,value,numArguments) {
    if(Module.hasOwnProperty(name)) {
        if(undefined===numArguments||undefined!==Module[name].overloadTable&&undefined!==Module[name].overloadTable[numArguments]) {
            throwBindingError("Cannot register public name '"+name+"' twice")
        }
        ensureOverloadTable(Module,name,name);
        if(Module.hasOwnProperty(numArguments)) {
            throwBindingError("Cannot register multiple overloads of a function with the same number of arguments ("+numArguments+")!")
        }
        Module[name].overloadTable[numArguments]=value
    }
    else {
        Module[name]=value;
        if(undefined!==numArguments) {
            Module[name].numArguments=numArguments
        }
    }
}
function RegisteredClass(name,constructor,instancePrototype,rawDestructor,baseClass,getActualType,upcast,downcast) {
    this.name=name;
    this.constructor=constructor;
    this.instancePrototype=instancePrototype;
    this.rawDestructor=rawDestructor;
    this.baseClass=baseClass;
    this.getActualType=getActualType;
    this.upcast=upcast;
    this.downcast=downcast;
    this.pureVirtualFunctions=[]
}
function upcastPointer(ptr,ptrClass,desiredClass) {
    while(ptrClass!==desiredClass) {
        if(!ptrClass.upcast) {
            throwBindingError("Expected null or instance of "+desiredClass.name+", got an instance of "+ptrClass.name)
        }
        ptr=ptrClass.upcast(ptr);
        ptrClass=ptrClass.baseClass
    }
    return ptr
}
function constNoSmartPtrRawPointerToWireType(destructors,handle) {
    if(handle===null) {
        if(this.isReference) {
            throwBindingError("null is not a valid "+this.name)
        }
        return 0
    }
    if(!handle.$$) {
        throwBindingError('Cannot pass "'+_embind_repr(handle)+'" as a '+this.name)
    }
    if(!handle.$$.ptr) {
        throwBindingError("Cannot pass deleted object as a pointer of type "+this.name)
    }
    var handleClass=handle.$$.ptrType.registeredClass;
    var ptr=upcastPointer(handle.$$.ptr,handleClass,this.registeredClass);
    return ptr
}
function genericPointerToWireType(destructors,handle) {
    var ptr;
    if(handle===null) {
        if(this.isReference) {
            throwBindingError("null is not a valid "+this.name)
        }
        if(this.isSmartPointer) {
            ptr=this.rawConstructor();
            if(destructors!==null) {
                destructors.push(this.rawDestructor,ptr)
            }
            return ptr
        }
        else {
            return 0
        }
    }
    if(!handle.$$) {
        throwBindingError('Cannot pass "'+_embind_repr(handle)+'" as a '+this.name)
    }
    if(!handle.$$.ptr) {
        throwBindingError("Cannot pass deleted object as a pointer of type "+this.name)
    }
    if(!this.isConst&&handle.$$.ptrType.isConst) {
        throwBindingError("Cannot convert argument of type "+(handle.$$.smartPtrType?handle.$$.smartPtrType.name:handle.$$.ptrType.name)+" to parameter type "+this.name)
    }
    var handleClass=handle.$$.ptrType.registeredClass;
    ptr=upcastPointer(handle.$$.ptr,handleClass,this.registeredClass);
    if(this.isSmartPointer) {
        if(undefined===handle.$$.smartPtr) {
            throwBindingError("Passing raw pointer to smart pointer is illegal")
        }
        switch(this.sharingPolicy) {
        case 0:
            if(handle.$$.smartPtrType===this) {
                ptr=handle.$$.smartPtr
            }
            else {
                throwBindingError("Cannot convert argument of type "+(handle.$$.smartPtrType?handle.$$.smartPtrType.name:handle.$$.ptrType.name)+" to parameter type "+this.name)
            }
            break;
        case 1:
            ptr=handle.$$.smartPtr;
            break;
        case 2:
            if(handle.$$.smartPtrType===this) {
                ptr=handle.$$.smartPtr
            }
            else {
                var clonedHandle=handle["clone"]();
                ptr=this.rawShare(ptr,__emval_register(function() {
                    clonedHandle["delete"]()
                }));
                if(destructors!==null) {
                    destructors.push(this.rawDestructor,ptr)
                }
            }
            break;
        default:
            throwBindingError("Unsupporting sharing policy")
        }
    }
    return ptr
}
function nonConstNoSmartPtrRawPointerToWireType(destructors,handle) {
    if(handle===null) {
        if(this.isReference) {
            throwBindingError("null is not a valid "+this.name)
        }
        return 0
    }
    if(!handle.$$) {
        throwBindingError('Cannot pass "'+_embind_repr(handle)+'" as a '+this.name)
    }
    if(!handle.$$.ptr) {
        throwBindingError("Cannot pass deleted object as a pointer of type "+this.name)
    }
    if(handle.$$.ptrType.isConst) {
        throwBindingError("Cannot convert argument of type "+handle.$$.ptrType.name+" to parameter type "+this.name)
    }
    var handleClass=handle.$$.ptrType.registeredClass;
    var ptr=upcastPointer(handle.$$.ptr,handleClass,this.registeredClass);
    return ptr
}
function simpleReadValueFromPointer(pointer) {
    return this["fromWireType"](HEAPU32[pointer>>2])
}
function RegisteredPointer_getPointee(ptr) {
    if(this.rawGetPointee) {
        ptr=this.rawGetPointee(ptr)
    }
    return ptr
}
function RegisteredPointer_destructor(ptr) {
    if(this.rawDestructor) {
        this.rawDestructor(ptr)
    }
}
function RegisteredPointer_deleteObject(handle) {
    if(handle!==null) {
        handle["delete"]()
    }
}
function downcastPointer(ptr,ptrClass,desiredClass) {
    if(ptrClass===desiredClass) {
        return ptr
    }
    if(undefined===desiredClass.baseClass) {
        return null
    }
    var rv=downcastPointer(ptr,ptrClass,desiredClass.baseClass);
    if(rv===null) {
        return null
    }
    return desiredClass.downcast(rv)
}
function getInheritedInstanceCount() {
    return Object.keys(registeredInstances).length
}
function getLiveInheritedInstances() {
    var rv=[];
    for(var k in registeredInstances) {
        if(registeredInstances.hasOwnProperty(k)) {
            rv.push(registeredInstances[k])
        }
    }
    return rv
}
function setDelayFunction(fn) {
    delayFunction=fn;
    if(deletionQueue.length&&delayFunction) {
        delayFunction(flushPendingDeletes)
    }
}
function init_embind() {
    Module["getInheritedInstanceCount"]=getInheritedInstanceCount;
    Module["getLiveInheritedInstances"]=getLiveInheritedInstances;
    Module["flushPendingDeletes"]=flushPendingDeletes;
    Module["setDelayFunction"]=setDelayFunction
}
var registeredInstances= {};
function getBasestPointer(class_,ptr) {
    if(ptr===undefined) {
        throwBindingError("ptr should not be undefined")
    }
    while(class_.baseClass) {
        ptr=class_.upcast(ptr);
        class_=class_.baseClass
    }
    return ptr
}
function getInheritedInstance(class_,ptr) {
    ptr=getBasestPointer(class_,ptr);
    return registeredInstances[ptr]
}
function makeClassHandle(prototype,record) {
    if(!record.ptrType||!record.ptr) {
        throwInternalError("makeClassHandle requires ptr and ptrType")
    }
    var hasSmartPtrType=!!record.smartPtrType;
    var hasSmartPtr=!!record.smartPtr;
    if(hasSmartPtrType!==hasSmartPtr) {
        throwInternalError("Both smartPtrType and smartPtr must be specified")
    }
    record.count= {value:1};
    return attachFinalizer(Object.create(prototype, {$$:{value:record}}))
}
function RegisteredPointer_fromWireType(ptr) {
    var rawPointer=this.getPointee(ptr);
    if(!rawPointer) {
        this.destructor(ptr);
        return null
    }
    var registeredInstance=getInheritedInstance(this.registeredClass,rawPointer);
    if(undefined!==registeredInstance) {
        if(0===registeredInstance.$$.count.value) {
            registeredInstance.$$.ptr=rawPointer;
            registeredInstance.$$.smartPtr=ptr;
            return registeredInstance["clone"]()
        }
        else {
            var rv=registeredInstance["clone"]();
            this.destructor(ptr);
            return rv
        }
    }
    function makeDefaultHandle() {
        if(this.isSmartPointer) {
            return makeClassHandle(this.registeredClass.instancePrototype, {ptrType:this.pointeeType,ptr:rawPointer,smartPtrType:this,smartPtr:ptr})
        }
        else {
            return makeClassHandle(this.registeredClass.instancePrototype, {ptrType:this,ptr:ptr})
        }
    }
    var actualType=this.registeredClass.getActualType(rawPointer);
    var registeredPointerRecord=registeredPointers[actualType];
    if(!registeredPointerRecord) {
        return makeDefaultHandle.call(this)
    }
    var toType;
    if(this.isConst) {
        toType=registeredPointerRecord.constPointerType
    }
    else {
        toType=registeredPointerRecord.pointerType
    }
    var dp=downcastPointer(rawPointer,this.registeredClass,toType.registeredClass);
    if(dp===null) {
        return makeDefaultHandle.call(this)
    }
    if(this.isSmartPointer) {
        return makeClassHandle(toType.registeredClass.instancePrototype, {ptrType:toType,ptr:dp,smartPtrType:this,smartPtr:ptr})
    }
    else {
        return makeClassHandle(toType.registeredClass.instancePrototype, {ptrType:toType,ptr:dp})
    }
}
function init_RegisteredPointer() {
    RegisteredPointer.prototype.getPointee=RegisteredPointer_getPointee;
    RegisteredPointer.prototype.destructor=RegisteredPointer_destructor;
    RegisteredPointer.prototype["argPackAdvance"]=8;
    RegisteredPointer.prototype["readValueFromPointer"]=simpleReadValueFromPointer;
    RegisteredPointer.prototype["deleteObject"]=RegisteredPointer_deleteObject;
    RegisteredPointer.prototype["fromWireType"]=RegisteredPointer_fromWireType
}
function RegisteredPointer(name,registeredClass,isReference,isConst,isSmartPointer,pointeeType,sharingPolicy,rawGetPointee,rawConstructor,rawShare,rawDestructor) {
    this.name=name;
    this.registeredClass=registeredClass;
    this.isReference=isReference;
    this.isConst=isConst;
    this.isSmartPointer=isSmartPointer;
    this.pointeeType=pointeeType;
    this.sharingPolicy=sharingPolicy;
    this.rawGetPointee=rawGetPointee;
    this.rawConstructor=rawConstructor;
    this.rawShare=rawShare;
    this.rawDestructor=rawDestructor;
    if(!isSmartPointer&&registeredClass.baseClass===undefined) {
        if(isConst) {
            this["toWireType"]=constNoSmartPtrRawPointerToWireType;
            this.destructorFunction=null
        }
        else {
            this["toWireType"]=nonConstNoSmartPtrRawPointerToWireType;
            this.destructorFunction=null
        }
    }
    else {
        this["toWireType"]=genericPointerToWireType
    }
}
function replacePublicSymbol(name,value,numArguments) {
    if(!Module.hasOwnProperty(name)) {
        throwInternalError("Replacing nonexistant public symbol")
    }
    if(undefined!==Module[name].overloadTable&&undefined!==numArguments) {
        Module[name].overloadTable[numArguments]=value
    }
    else {
        Module[name]=value;
        Module[name].argCount=numArguments
    }
}
function embind__requireFunction(signature,rawFunction) {
    signature=readLatin1String(signature);
    function makeDynCaller(dynCall) {
        var args=[];
        for(var i=1; i<signature.length; ++i) {
            args.push("a"+i)
        }
        var name="dynCall_"+signature+"_"+rawFunction;
        var body="return function "+name+"("+args.join(", ")+") {\n";
        body+="    return dynCall(rawFunction"+(args.length?", ":"")+args.join(", ")+");\n";
        body+="};\n";
        return new Function("dynCall","rawFunction",body)(dynCall,rawFunction)
    }
    var fp;
    if(Module["FUNCTION_TABLE_"+signature]!==undefined) {
        fp=Module["FUNCTION_TABLE_"+signature][rawFunction]
    }
    else if(typeof FUNCTION_TABLE!=="undefined") {
        fp=FUNCTION_TABLE[rawFunction]
    }
    else {
        var dc=Module["dynCall_"+signature];
        if(dc===undefined) {
            dc=Module["dynCall_"+signature.replace(/f/g,"d")];
            if(dc===undefined) {
                throwBindingError("No dynCall invoker for signature: "+signature)
            }
        }
        fp=makeDynCaller(dc)
    }
    if(typeof fp!=="function") {
        throwBindingError("unknown function pointer with signature "+signature+": "+rawFunction)
    }
    return fp
}
var UnboundTypeError=undefined;
function getTypeName(type) {
    var ptr=___getTypeName(type);
    var rv=readLatin1String(ptr);
    _free(ptr);
    return rv
}
function throwUnboundTypeError(message,types) {
    var unboundTypes=[];
    var seen= {};
    function visit(type) {
        if(seen[type]) {
            return
        }
        if(registeredTypes[type]) {
            return
        }
        if(typeDependencies[type]) {
            typeDependencies[type].forEach(visit);
            return
        }
        unboundTypes.push(type);
        seen[type]=true
    }
    types.forEach(visit);
    throw new UnboundTypeError(message+": "+unboundTypes.map(getTypeName).join([", "]))
}
function __embind_register_class(rawType,rawPointerType,rawConstPointerType,baseClassRawType,getActualTypeSignature,getActualType,upcastSignature,upcast,downcastSignature,downcast,name,destructorSignature,rawDestructor) {
    name=readLatin1String(name);
    getActualType=embind__requireFunction(getActualTypeSignature,getActualType);
    if(upcast) {
        upcast=embind__requireFunction(upcastSignature,upcast)
    }
    if(downcast) {
        downcast=embind__requireFunction(downcastSignature,downcast)
    }
    rawDestructor=embind__requireFunction(destructorSignature,rawDestructor);
    var legalFunctionName=makeLegalFunctionName(name);
    exposePublicSymbol(legalFunctionName,function() {
        throwUnboundTypeError("Cannot construct "+name+" due to unbound types",[baseClassRawType])
    });
    whenDependentTypesAreResolved([rawType,rawPointerType,rawConstPointerType],baseClassRawType?[baseClassRawType]:[],function(base) {
        base=base[0];
        var baseClass;
        var basePrototype;
        if(baseClassRawType) {
            baseClass=base.registeredClass;
            basePrototype=baseClass.instancePrototype
        }
        else {
            basePrototype=ClassHandle.prototype
        }
        var constructor=createNamedFunction(legalFunctionName,function() {
            if(Object.getPrototypeOf(this)!==instancePrototype) {
                throw new BindingError("Use 'new' to construct "+name)
            }
            if(undefined===registeredClass.constructor_body) {
                throw new BindingError(name+" has no accessible constructor")
            }
            var body=registeredClass.constructor_body[arguments.length];
            if(undefined===body) {
                throw new BindingError("Tried to invoke ctor of "+name+" with invalid number of parameters ("+arguments.length+") - expected ("+Object.keys(registeredClass.constructor_body).toString()+") parameters instead!")
            }
            return body.apply(this,arguments)
        });
        var instancePrototype=Object.create(basePrototype, {constructor:{value:constructor}});
        constructor.prototype=instancePrototype;
        var registeredClass=new RegisteredClass(name,constructor,instancePrototype,rawDestructor,baseClass,getActualType,upcast,downcast);
        var referenceConverter=new RegisteredPointer(name,registeredClass,true,false,false);
        var pointerConverter=new RegisteredPointer(name+"*",registeredClass,false,false,false);
        var constPointerConverter=new RegisteredPointer(name+" const*",registeredClass,false,true,false);
        registeredPointers[rawType]= {pointerType:pointerConverter,constPointerType:constPointerConverter};
        replacePublicSymbol(legalFunctionName,constructor);
        return[referenceConverter,pointerConverter,constPointerConverter]
    })
}
function new_(constructor,argumentList) {
    if(!(constructor instanceof Function)) {
        throw new TypeError("new_ called with constructor type "+typeof constructor+" which is not a function")
    }
    var dummy=createNamedFunction(constructor.name||"unknownFunctionName",function() {});
    dummy.prototype=constructor.prototype;
    var obj=new dummy;
    var r=constructor.apply(obj,argumentList);
    return r instanceof Object?r:obj
}
function runDestructors(destructors) {
    while(destructors.length) {
        var ptr=destructors.pop();
        var del=destructors.pop();
        del(ptr)
    }
}
function craftInvokerFunction(humanName,argTypes,classType,cppInvokerFunc,cppTargetFunc) {
    var argCount=argTypes.length;
    if(argCount<2) {
        throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!")
    }
    var isClassMethodFunc=argTypes[1]!==null&&classType!==null;
    var needsDestructorStack=false;
    for(var i=1; i<argTypes.length; ++i) {
        if(argTypes[i]!==null&&argTypes[i].destructorFunction===undefined) {
            needsDestructorStack=true;
            break
        }
    }
    var returns=argTypes[0].name!=="void";
    var argsList="";
    var argsListWired="";
    for(var i=0; i<argCount-2; ++i) {
        argsList+=(i!==0?", ":"")+"arg"+i;
        argsListWired+=(i!==0?", ":"")+"arg"+i+"Wired"
    }
    var invokerFnBody="return function "+makeLegalFunctionName(humanName)+"("+argsList+") {\n"+"if (arguments.length !== "+(argCount-2)+") {\n"+"throwBindingError('function "+humanName+" called with ' + arguments.length + ' arguments, expected "+(argCount-2)+" args!');\n"+"}\n";
    if(needsDestructorStack) {
        invokerFnBody+="var destructors = [];\n"
    }
    var dtorStack=needsDestructorStack?"destructors":"null";
    var args1=["throwBindingError","invoker","fn","runDestructors","retType","classParam"];
    var args2=[throwBindingError,cppInvokerFunc,cppTargetFunc,runDestructors,argTypes[0],argTypes[1]];
    if(isClassMethodFunc) {
        invokerFnBody+="var thisWired = classParam.toWireType("+dtorStack+", this);\n"
    }
    for(var i=0; i<argCount-2; ++i) {
        invokerFnBody+="var arg"+i+"Wired = argType"+i+".toWireType("+dtorStack+", arg"+i+"); // "+argTypes[i+2].name+"\n";
        args1.push("argType"+i);
        args2.push(argTypes[i+2])
    }
    if(isClassMethodFunc) {
        argsListWired="thisWired"+(argsListWired.length>0?", ":"")+argsListWired
    }
    invokerFnBody+=(returns?"var rv = ":"")+"invoker(fn"+(argsListWired.length>0?", ":"")+argsListWired+");\n";
    if(needsDestructorStack) {
        invokerFnBody+="runDestructors(destructors);\n"
    }
    else {
        for(var i=isClassMethodFunc?1:2; i<argTypes.length; ++i) {
            var paramName=i===1?"thisWired":"arg"+(i-2)+"Wired";
            if(argTypes[i].destructorFunction!==null) {
                invokerFnBody+=paramName+"_dtor("+paramName+"); // "+argTypes[i].name+"\n";
                args1.push(paramName+"_dtor");
                args2.push(argTypes[i].destructorFunction)
            }
        }
    }
    if(returns) {
        invokerFnBody+="var ret = retType.fromWireType(rv);\n"+"return ret;\n"
    }
    else {} invokerFnBody+="}\n";
    args1.push(invokerFnBody);
    var invokerFunction=new_(Function,args1).apply(null,args2);
    return invokerFunction
}
function heap32VectorToArray(count,firstElement) {
    var array=[];
    for(var i=0; i<count; i++) {
        array.push(HEAP32[(firstElement>>2)+i])
    }
    return array
}
function __embind_register_class_function(rawClassType,methodName,argCount,rawArgTypesAddr,invokerSignature,rawInvoker,context,isPureVirtual) {
    var rawArgTypes=heap32VectorToArray(argCount,rawArgTypesAddr);
    methodName=readLatin1String(methodName);
    rawInvoker=embind__requireFunction(invokerSignature,rawInvoker);
    whenDependentTypesAreResolved([],[rawClassType],function(classType) {
        classType=classType[0];
        var humanName=classType.name+"."+methodName;
        if(isPureVirtual) {
            classType.registeredClass.pureVirtualFunctions.push(methodName)
        }
        function unboundTypesHandler() {
            throwUnboundTypeError("Cannot call "+humanName+" due to unbound types",rawArgTypes)
        }
        var proto=classType.registeredClass.instancePrototype;
        var method=proto[methodName];
        if(undefined===method||undefined===method.overloadTable&&method.className!==classType.name&&method.argCount===argCount-2) {
            unboundTypesHandler.argCount=argCount-2;
            unboundTypesHandler.className=classType.name;
            proto[methodName]=unboundTypesHandler
        }
        else {
            ensureOverloadTable(proto,methodName,humanName);
            proto[methodName].overloadTable[argCount-2]=unboundTypesHandler
        }
        whenDependentTypesAreResolved([],rawArgTypes,function(argTypes) {
            var memberFunction=craftInvokerFunction(humanName,argTypes,classType,rawInvoker,context);
            if(undefined===proto[methodName].overloadTable) {
                memberFunction.argCount=argCount-2;
                proto[methodName]=memberFunction
            }
            else {
                proto[methodName].overloadTable[argCount-2]=memberFunction
            }
            return[]
        });
        return[]
    })
}
var emval_free_list=[];
var emval_handle_array=[ {}, {value:undefined}, {value:null}, {value:true}, {value:false}];
function __emval_decref(handle) {
    if(handle>4&&0===--emval_handle_array[handle].refcount) {
        emval_handle_array[handle]=undefined;
        emval_free_list.push(handle)
    }
}
function count_emval_handles() {
    var count=0;
    for(var i=5; i<emval_handle_array.length; ++i) {
        if(emval_handle_array[i]!==undefined) {
            ++count
        }
    }
    return count
}
function get_first_emval() {
    for(var i=5; i<emval_handle_array.length; ++i) {
        if(emval_handle_array[i]!==undefined) {
            return emval_handle_array[i]
        }
    }
    return null
}
function init_emval() {
    Module["count_emval_handles"]=count_emval_handles;
    Module["get_first_emval"]=get_first_emval
}
function __emval_register(value) {
    switch(value) {
    case undefined: {
        return 1
    }
    case null: {
        return 2
    }
    case true: {
        return 3
    }
    case false: {
        return 4
    }
    default: {
        var handle=emval_free_list.length?emval_free_list.pop():emval_handle_array.length;
        emval_handle_array[handle]= {refcount:1,value:value};
        return handle
    }
    }
}
function __embind_register_emval(rawType,name) {
    name=readLatin1String(name);
    registerType(rawType, {name:name,"fromWireType":function(handle) {
        var rv=emval_handle_array[handle].value;
        __emval_decref(handle);
        return rv
    },"toWireType":function(destructors,value) {
        return __emval_register(value)
    },"argPackAdvance":8,"readValueFromPointer":simpleReadValueFromPointer,destructorFunction:null
                          })
}
function _embind_repr(v) {
    if(v===null) {
        return"null"
    }
    var t=typeof v;
    if(t==="object"||t==="array"||t==="function") {
        return v.toString()
    }
    else {
        return""+v
    }
}
function floatReadValueFromPointer(name,shift) {
    switch(shift) {
    case 2:
        return function(pointer) {
            return this["fromWireType"](HEAPF32[pointer>>2])
        };
    case 3:
        return function(pointer) {
            return this["fromWireType"](HEAPF64[pointer>>3])
        };
    default:
        throw new TypeError("Unknown float type: "+name)
    }
}
function __embind_register_float(rawType,name,size) {
    var shift=getShiftFromSize(size);
    name=readLatin1String(name);
    registerType(rawType, {name:name,"fromWireType":function(value) {
        return value
    },"toWireType":function(destructors,value) {
        if(typeof value!=="number"&&typeof value!=="boolean") {
            throw new TypeError('Cannot convert "'+_embind_repr(value)+'" to '+this.name)
        }
        return value
    },"argPackAdvance":8,"readValueFromPointer":floatReadValueFromPointer(name,shift),destructorFunction:null
                          })
}
function __embind_register_function(name,argCount,rawArgTypesAddr,signature,rawInvoker,fn) {
    var argTypes=heap32VectorToArray(argCount,rawArgTypesAddr);
    name=readLatin1String(name);
    rawInvoker=embind__requireFunction(signature,rawInvoker);
    exposePublicSymbol(name,function() {
        throwUnboundTypeError("Cannot call "+name+" due to unbound types",argTypes)
    },argCount-1);
    whenDependentTypesAreResolved([],argTypes,function(argTypes) {
        var invokerArgsArray=[argTypes[0],null].concat(argTypes.slice(1));
        replacePublicSymbol(name,craftInvokerFunction(name,invokerArgsArray,null,rawInvoker,fn),argCount-1);
        return[]
    })
}
function integerReadValueFromPointer(name,shift,signed) {
    switch(shift) {
    case 0:
        return signed?function readS8FromPointer(pointer) {
            return HEAP8[pointer]
}:
        function readU8FromPointer(pointer) {
            return HEAPU8[pointer]
        };
    case 1:
        return signed?function readS16FromPointer(pointer) {
            return HEAP16[pointer>>1]
}:
        function readU16FromPointer(pointer) {
            return HEAPU16[pointer>>1]
        };
    case 2:
        return signed?function readS32FromPointer(pointer) {
            return HEAP32[pointer>>2]
}:
        function readU32FromPointer(pointer) {
            return HEAPU32[pointer>>2]
        };
    default:
        throw new TypeError("Unknown integer type: "+name)
    }
}
function __embind_register_integer(primitiveType,name,size,minRange,maxRange) {
    name=readLatin1String(name);
    if(maxRange===-1) {
        maxRange=4294967295
    }
    var shift=getShiftFromSize(size);
    var fromWireType=function(value) {
        return value
    };
    if(minRange===0) {
        var bitshift=32-8*size;
        fromWireType=function(value) {
            return value<<bitshift>>>bitshift
        }
    }
    var isUnsignedType=name.indexOf("unsigned")!=-1;
    registerType(primitiveType, {name:name,"fromWireType":fromWireType,"toWireType":function(destructors,value) {
        if(typeof value!=="number"&&typeof value!=="boolean") {
            throw new TypeError('Cannot convert "'+_embind_repr(value)+'" to '+this.name)
        }
        if(value<minRange||value>maxRange) {
            throw new TypeError('Passing a number "'+_embind_repr(value)+'" from JS side to C/C++ side to an argument of type "'+name+'", which is outside the valid range ['+minRange+", "+maxRange+"]!")
        }
        return isUnsignedType?value>>>0:value|0
    },"argPackAdvance":8,"readValueFromPointer":integerReadValueFromPointer(name,shift,minRange!==0),destructorFunction:null
                                })
}
function __embind_register_memory_view(rawType,dataTypeIndex,name) {
    var typeMapping=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array];
    var TA=typeMapping[dataTypeIndex];
    function decodeMemoryView(handle) {
        handle=handle>>2;
        var heap=HEAPU32;
        var size=heap[handle];
        var data=heap[handle+1];
        return new TA(heap["buffer"],data,size)
    }
    name=readLatin1String(name);
    registerType(rawType, {name:name,"fromWireType":decodeMemoryView,"argPackAdvance":8,"readValueFromPointer":decodeMemoryView}, {ignoreDuplicateRegistrations:true})
}
function __embind_register_std_string(rawType,name) {
    name=readLatin1String(name);
    var stdStringIsUTF8=name==="std::string";
    registerType(rawType, {name:name,"fromWireType":function(value) {
        var length=HEAPU32[value>>2];
        var str;
        if(stdStringIsUTF8) {
            var endChar=HEAPU8[value+4+length];
            var endCharSwap=0;
            if(endChar!=0) {
                endCharSwap=endChar;
                HEAPU8[value+4+length]=0
            }
            var decodeStartPtr=value+4;
            for(var i=0; i<=length; ++i) {
                var currentBytePtr=value+4+i;
                if(HEAPU8[currentBytePtr]==0) {
                    var stringSegment=UTF8ToString(decodeStartPtr);
                    if(str===undefined)str=stringSegment;
                    else {
                        str+=String.fromCharCode(0);
                        str+=stringSegment
                    }
                    decodeStartPtr=currentBytePtr+1
                }
            }
            if(endCharSwap!=0)HEAPU8[value+4+length]=endCharSwap
            }
        else {
            var a=new Array(length);
            for(var i=0; i<length; ++i) {
                a[i]=String.fromCharCode(HEAPU8[value+4+i])
            }
            str=a.join("")
        }
        _free(value);
        return str
    },"toWireType":function(destructors,value) {
        if(value instanceof ArrayBuffer) {
            value=new Uint8Array(value)
        }
        var getLength;
        var valueIsOfTypeString=typeof value==="string";
        if(!(valueIsOfTypeString||value instanceof Uint8Array||value instanceof Uint8ClampedArray||value instanceof Int8Array)) {
            throwBindingError("Cannot pass non-string to std::string")
        }
        if(stdStringIsUTF8&&valueIsOfTypeString) {
            getLength=function() {
                return lengthBytesUTF8(value)
            }
        }
        else {
            getLength=function() {
                return value.length
            }
        }
        var length=getLength();
        var ptr=_malloc(4+length+1);
        HEAPU32[ptr>>2]=length;
        if(stdStringIsUTF8&&valueIsOfTypeString) {
            stringToUTF8(value,ptr+4,length+1)
        }
        else {
            if(valueIsOfTypeString) {
                for(var i=0; i<length; ++i) {
                    var charCode=value.charCodeAt(i);
                    if(charCode>255) {
                        _free(ptr);
                        throwBindingError("String has UTF-16 code units that do not fit in 8 bits")
                    }
                    HEAPU8[ptr+4+i]=charCode
                }
            }
            else {
                for(var i=0; i<length; ++i) {
                    HEAPU8[ptr+4+i]=value[i]
                }
            }
        }
        if(destructors!==null) {
            destructors.push(_free,ptr)
        }
        return ptr
    },"argPackAdvance":8,"readValueFromPointer":simpleReadValueFromPointer,destructorFunction:function(ptr) {
        _free(ptr)
    }
                          })
}
function __embind_register_std_wstring(rawType,charSize,name) {
    name=readLatin1String(name);
    var getHeap,shift;
    if(charSize===2) {
        getHeap=function() {
            return HEAPU16
        };
        shift=1
    }
    else if(charSize===4) {
        getHeap=function() {
            return HEAPU32
        };
        shift=2
    }
    registerType(rawType, {name:name,"fromWireType":function(value) {
        var HEAP=getHeap();
        var length=HEAPU32[value>>2];
        var a=new Array(length);
        var start=value+4>>shift;
        for(var i=0; i<length; ++i) {
            a[i]=String.fromCharCode(HEAP[start+i])
        }
        _free(value);
        return a.join("")
    },"toWireType":function(destructors,value) {
        var HEAP=getHeap();
        var length=value.length;
        var ptr=_malloc(4+length*charSize);
        HEAPU32[ptr>>2]=length;
        var start=ptr+4>>shift;
        for(var i=0; i<length; ++i) {
            HEAP[start+i]=value.charCodeAt(i)
        }
        if(destructors!==null) {
            destructors.push(_free,ptr)
        }
        return ptr
    },"argPackAdvance":8,"readValueFromPointer":simpleReadValueFromPointer,destructorFunction:function(ptr) {
        _free(ptr)
    }
                          })
}
function __embind_register_void(rawType,name) {
    name=readLatin1String(name);
    registerType(rawType, {isVoid:true,name:name,"argPackAdvance":0,"fromWireType":function() {
        return undefined
    },"toWireType":function(destructors,o) {
        return undefined
    }
                          })
}
function requireHandle(handle) {
    if(!handle) {
        throwBindingError("Cannot use deleted val. handle = "+handle)
    }
    return emval_handle_array[handle].value
}
function requireRegisteredType(rawType,humanName) {
    var impl=registeredTypes[rawType];
    if(undefined===impl) {
        throwBindingError(humanName+" has unknown type "+getTypeName(rawType))
    }
    return impl
}
function __emval_as(handle,returnType,destructorsRef) {
    handle=requireHandle(handle);
    returnType=requireRegisteredType(returnType,"emval::as");
    var destructors=[];
    var rd=__emval_register(destructors);
    HEAP32[destructorsRef>>2]=rd;
    return returnType["toWireType"](destructors,handle)
}
function __emval_get_property(handle,key) {
    handle=requireHandle(handle);
    key=requireHandle(key);
    return __emval_register(handle[key])
}
function __emval_incref(handle) {
    if(handle>4) {
        emval_handle_array[handle].refcount+=1
    }
}
var emval_symbols= {};
function getStringOrSymbol(address) {
    var symbol=emval_symbols[address];
    if(symbol===undefined) {
        return readLatin1String(address)
    }
    else {
        return symbol
    }
}
function __emval_new_cstring(v) {
    return __emval_register(getStringOrSymbol(v))
}
function __emval_run_destructors(handle) {
    var destructors=emval_handle_array[handle].value;
    runDestructors(destructors);
    __emval_decref(handle)
}
function __emval_take_value(type,argv) {
    type=requireRegisteredType(type,"_emval_take_value");
    var v=type["readValueFromPointer"](argv);
    return __emval_register(v)
}
function _abort() {
    Module["abort"]()
}
function _emscripten_get_heap_size() {
    return HEAP8.length
}
function _emscripten_memcpy_big(dest,src,num) {
    HEAPU8.set(HEAPU8.subarray(src,src+num),dest)
}
function ___setErrNo(value) {
    if(Module["___errno_location"])HEAP32[Module["___errno_location"]()>>2]=value;
    return value
}
function abortOnCannotGrowMemory(requestedSize) {
    abort("OOM")
}
function emscripten_realloc_buffer(size) {
    try {
        wasmMemory.grow(size-buffer.byteLength+65535>>16);
        updateGlobalBufferAndViews(wasmMemory.buffer);
        return 1
    }
    catch(e) {}
} function _emscripten_resize_heap(requestedSize) {
    var oldSize=_emscripten_get_heap_size();
    var PAGE_MULTIPLE=65536;
    var LIMIT=2147483648-PAGE_MULTIPLE;
    if(requestedSize>LIMIT) {
        return false
    }
    var MIN_TOTAL_MEMORY=16777216;
    var newSize=Math.max(oldSize,MIN_TOTAL_MEMORY);
    while(newSize<requestedSize) {
        if(newSize<=536870912) {
            newSize=alignUp(2*newSize,PAGE_MULTIPLE)
        }
        else {
            newSize=Math.min(alignUp((3*newSize+2147483648)/4,PAGE_MULTIPLE),LIMIT)
        }
    }
    var replacement=emscripten_realloc_buffer(newSize);
    if(!replacement) {
        return false
    }
    return true
}
embind_init_charCodes();
BindingError=Module["BindingError"]=extendError(Error,"BindingError");
InternalError=Module["InternalError"]=extendError(Error,"InternalError");
init_ClassHandle();
init_RegisteredPointer();
init_embind();
UnboundTypeError=Module["UnboundTypeError"]=extendError(Error,"UnboundTypeError");
init_emval();
var ASSERTIONS=false;
function intArrayToString(array) {
    var ret=[];
    for(var i=0; i<array.length; i++) {
        var chr=array[i];
        if(chr>255) {
            if(ASSERTIONS) {
                assert(false,"Character code "+chr+" ("+String.fromCharCode(chr)+")  at offset "+i+" not in 0x00-0xFF.")
            }
            chr&=255
        }
        ret.push(String.fromCharCode(chr))
    }
    return ret.join("")
}
var decodeBase64=typeof atob==="function"?atob:function(input) {
    var keyStr="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output="";
    var chr1,chr2,chr3;
    var enc1,enc2,enc3,enc4;
    var i=0;
    input=input.replace(/[^A-Za-z0-9\+\/\=]/g,"");
    do {
        enc1=keyStr.indexOf(input.charAt(i++));
        enc2=keyStr.indexOf(input.charAt(i++));
        enc3=keyStr.indexOf(input.charAt(i++));
        enc4=keyStr.indexOf(input.charAt(i++));
        chr1=enc1<<2|enc2>>4;
        chr2=(enc2&15)<<4|enc3>>2;
        chr3=(enc3&3)<<6|enc4;
        output=output+String.fromCharCode(chr1);
        if(enc3!==64) {
            output=output+String.fromCharCode(chr2)
        }
        if(enc4!==64) {
            output=output+String.fromCharCode(chr3)
        }
    }
    while(i<input.length);
    return output
};
function intArrayFromBase64(s) {
    if(typeof ENVIRONMENT_IS_NODE==="boolean"&&ENVIRONMENT_IS_NODE) {
        var buf;
        try {
            buf=Buffer.from(s,"base64")
        }
        catch(_) {
            buf=new Buffer(s,"base64")
        }
        return new Uint8Array(buf.buffer,buf.byteOffset,buf.byteLength)
    }
    try {
        var decoded=decodeBase64(s);
        var bytes=new Uint8Array(decoded.length);
        for(var i=0; i<decoded.length; ++i) {
            bytes[i]=decoded.charCodeAt(i)
        }
        return bytes
    }
    catch(_) {
        throw new Error("Converting base64 string to bytes failed.")
    }
}
function tryParseAsDataURI(filename) {
    if(!isDataURI(filename)) {
        return
    }
    return intArrayFromBase64(filename.slice(dataURIPrefix.length))
}
var asmGlobalArg= {};
var asmLibraryArg= {"abort":abort,"setTempRet0":setTempRet0,"getTempRet0":getTempRet0,"ClassHandle":ClassHandle,"ClassHandle_clone":ClassHandle_clone,"ClassHandle_delete":ClassHandle_delete,"ClassHandle_deleteLater":ClassHandle_deleteLater,"ClassHandle_isAliasOf":ClassHandle_isAliasOf,"ClassHandle_isDeleted":ClassHandle_isDeleted,"RegisteredClass":RegisteredClass,"RegisteredPointer":RegisteredPointer,"RegisteredPointer_deleteObject":RegisteredPointer_deleteObject,"RegisteredPointer_destructor":RegisteredPointer_destructor,"RegisteredPointer_fromWireType":RegisteredPointer_fromWireType,"RegisteredPointer_getPointee":RegisteredPointer_getPointee,"___gxx_personality_v0":___gxx_personality_v0,"___setErrNo":___setErrNo,"__embind_register_bool":__embind_register_bool,"__embind_register_class":__embind_register_class,"__embind_register_class_function":__embind_register_class_function,"__embind_register_emval":__embind_register_emval,"__embind_register_float":__embind_register_float,"__embind_register_function":__embind_register_function,"__embind_register_integer":__embind_register_integer,"__embind_register_memory_view":__embind_register_memory_view,"__embind_register_std_string":__embind_register_std_string,"__embind_register_std_wstring":__embind_register_std_wstring,"__embind_register_void":__embind_register_void,"__emval_as":__emval_as,"__emval_decref":__emval_decref,"__emval_get_property":__emval_get_property,"__emval_incref":__emval_incref,"__emval_new_cstring":__emval_new_cstring,"__emval_register":__emval_register,"__emval_run_destructors":__emval_run_destructors,"__emval_take_value":__emval_take_value,"_abort":_abort,"_embind_repr":_embind_repr,"_emscripten_get_heap_size":_emscripten_get_heap_size,"_emscripten_memcpy_big":_emscripten_memcpy_big,"_emscripten_resize_heap":_emscripten_resize_heap,"abortOnCannotGrowMemory":abortOnCannotGrowMemory,"attachFinalizer":attachFinalizer,"constNoSmartPtrRawPointerToWireType":constNoSmartPtrRawPointerToWireType,"count_emval_handles":count_emval_handles,"craftInvokerFunction":craftInvokerFunction,"createNamedFunction":createNamedFunction,"demangle":demangle,"demangleAll":demangleAll,"detachFinalizer":detachFinalizer,"downcastPointer":downcastPointer,"embind__requireFunction":embind__requireFunction,"embind_init_charCodes":embind_init_charCodes,"emscripten_realloc_buffer":emscripten_realloc_buffer,"ensureOverloadTable":ensureOverloadTable,"exposePublicSymbol":exposePublicSymbol,"extendError":extendError,"floatReadValueFromPointer":floatReadValueFromPointer,"flushPendingDeletes":flushPendingDeletes,"genericPointerToWireType":genericPointerToWireType,"getBasestPointer":getBasestPointer,"getInheritedInstance":getInheritedInstance,"getInheritedInstanceCount":getInheritedInstanceCount,"getLiveInheritedInstances":getLiveInheritedInstances,"getShiftFromSize":getShiftFromSize,"getStringOrSymbol":getStringOrSymbol,"getTypeName":getTypeName,"get_first_emval":get_first_emval,"heap32VectorToArray":heap32VectorToArray,"init_ClassHandle":init_ClassHandle,"init_RegisteredPointer":init_RegisteredPointer,"init_embind":init_embind,"init_emval":init_emval,"integerReadValueFromPointer":integerReadValueFromPointer,"jsStackTrace":jsStackTrace,"makeClassHandle":makeClassHandle,"makeLegalFunctionName":makeLegalFunctionName,"new_":new_,"nonConstNoSmartPtrRawPointerToWireType":nonConstNoSmartPtrRawPointerToWireType,"readLatin1String":readLatin1String,"registerType":registerType,"releaseClassHandle":releaseClassHandle,"replacePublicSymbol":replacePublicSymbol,"requireHandle":requireHandle,"requireRegisteredType":requireRegisteredType,"runDestructor":runDestructor,"runDestructors":runDestructors,"setDelayFunction":setDelayFunction,"shallowCopyInternalPointer":shallowCopyInternalPointer,"simpleReadValueFromPointer":simpleReadValueFromPointer,"stackTrace":stackTrace,"throwBindingError":throwBindingError,"throwInstanceAlreadyDeleted":throwInstanceAlreadyDeleted,"throwInternalError":throwInternalError,"throwUnboundTypeError":throwUnboundTypeError,"upcastPointer":upcastPointer,"whenDependentTypesAreResolved":whenDependentTypesAreResolved,"tempDoublePtr":tempDoublePtr,"DYNAMICTOP_PTR":DYNAMICTOP_PTR};
var asm=Module["asm"](asmGlobalArg,asmLibraryArg,buffer);
var __Z12createModulei=Module["__Z12createModulei"]=asm["__Z12createModulei"];
var ___embind_register_native_and_builtin_types=Module["___embind_register_native_and_builtin_types"]=asm["___embind_register_native_and_builtin_types"];
var ___errno_location=Module["___errno_location"]=asm["___errno_location"];
var ___getTypeName=Module["___getTypeName"]=asm["___getTypeName"];
var __hook_cycle=Module["__hook_cycle"]=asm["__hook_cycle"];
var __hook_init=Module["__hook_init"]=asm["__hook_init"];
var __hook_off=Module["__hook_off"]=asm["__hook_off"];
var __hook_on=Module["__hook_on"]=asm["__hook_on"];
var __hook_param=Module["__hook_param"]=asm["__hook_param"];
var __osc_bl_par_idx=Module["__osc_bl_par_idx"]=asm["__osc_bl_par_idx"];
var __osc_bl_saw_idx=Module["__osc_bl_saw_idx"]=asm["__osc_bl_saw_idx"];
var __osc_bl_sqr_idx=Module["__osc_bl_sqr_idx"]=asm["__osc_bl_sqr_idx"];
var __osc_mcu_hash=Module["__osc_mcu_hash"]=asm["__osc_mcu_hash"];
var __osc_rand=Module["__osc_rand"]=asm["__osc_rand"];
var __osc_white=Module["__osc_white"]=asm["__osc_white"];
var _emscripten_replace_memory=Module["_emscripten_replace_memory"]=asm["_emscripten_replace_memory"];
var _free=Module["_free"]=asm["_free"];
var _malloc=Module["_malloc"]=asm["_malloc"];
var _memcpy=Module["_memcpy"]=asm["_memcpy"];
var _memset=Module["_memset"]=asm["_memset"];
var _osc_api_init=Module["_osc_api_init"]=asm["_osc_api_init"];
var _sbrk=Module["_sbrk"]=asm["_sbrk"];
var establishStackSpace=Module["establishStackSpace"]=asm["establishStackSpace"];
var globalCtors=Module["globalCtors"]=asm["globalCtors"];
var stackAlloc=Module["stackAlloc"]=asm["stackAlloc"];
var stackRestore=Module["stackRestore"]=asm["stackRestore"];
var stackSave=Module["stackSave"]=asm["stackSave"];
var dynCall_ii=Module["dynCall_ii"]=asm["dynCall_ii"];
var dynCall_iii=Module["dynCall_iii"]=asm["dynCall_iii"];
var dynCall_iiii=Module["dynCall_iiii"]=asm["dynCall_iiii"];
var dynCall_iiiii=Module["dynCall_iiiii"]=asm["dynCall_iiiii"];
var dynCall_iiiiii=Module["dynCall_iiiiii"]=asm["dynCall_iiiiii"];
var dynCall_iiiiiii=Module["dynCall_iiiiiii"]=asm["dynCall_iiiiiii"];
var dynCall_v=Module["dynCall_v"]=asm["dynCall_v"];
var dynCall_vi=Module["dynCall_vi"]=asm["dynCall_vi"];
var dynCall_vii=Module["dynCall_vii"]=asm["dynCall_vii"];
var dynCall_viid=Module["dynCall_viid"]=asm["dynCall_viid"];
var dynCall_viiid=Module["dynCall_viiid"]=asm["dynCall_viiid"];
var dynCall_viiii=Module["dynCall_viiii"]=asm["dynCall_viiii"];
var dynCall_viiiii=Module["dynCall_viiiii"]=asm["dynCall_viiiii"];
var dynCall_viiiiii=Module["dynCall_viiiiii"]=asm["dynCall_viiiiii"];
Module["asm"]=asm;
var calledRun;
function ExitStatus(status) {
    this.name="ExitStatus";
    this.message="Program terminated with exit("+status+")";
    this.status=status
}
dependenciesFulfilled=function runCaller() {
    if(!calledRun)run();
    if(!calledRun)dependenciesFulfilled=runCaller
    };
function run(args) {
    args=args||arguments_;
    if(runDependencies>0) {
        return
    }
    preRun();
    if(runDependencies>0)return;
    function doRun() {
        if(calledRun)return;
        calledRun=true;
        if(ABORT)return;
        initRuntime();
        preMain();
        if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();
        postRun()
    }
    if(Module["setStatus"]) {
        Module["setStatus"]("Running...");
        setTimeout(function() {
            setTimeout(function() {
                Module["setStatus"]("")
            },1);
            doRun()
        },1)
    }
    else {
        doRun()
    }
}
Module["run"]=run;
function abort(what) {
    if(Module["onAbort"]) {
        Module["onAbort"](what)
    }
    what+="";
    out(what);
    err(what);
    ABORT=true;
    EXITSTATUS=1;
    throw"abort("+what+"). Build with -s ASSERTIONS=1 for more info."
}
Module["abort"]=abort;
if(Module["preInit"]) {
    if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];
    while(Module["preInit"].length>0) {
        Module["preInit"].pop()()
    }
}
noExitRuntime=true;
run();
