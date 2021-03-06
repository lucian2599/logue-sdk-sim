var Module=typeof WABModule!=="undefined"?WABModule: {};
WABModule.manifest= {"header":{"platform":"prologue","module":"osc","api":"1.1-0","dev_id":0,"prg_id":0,"version":"1.0-1","name":"waves","num_param":6,"params":[["Wave A",0,45,""],["Wave B",0,43,""],["Sub Wave",0,15,""],["Sub Mix",0,100,"%"],["Ring Mix",0,100,"%"],["Bit Crush",0,100,"%"]]}};
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
var STACK_BASE=67984,DYNAMIC_BASE=5310864,DYNAMICTOP_PTR=67952;
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
var wasmBinaryFile="data:application/octet-stream;base64,AGFzbQEAAAABtgEZYAF/AGAEf39/fwBgBH9/f38Bf2ADf398AGAGf39/f39/AGABfwF/YAAAYAV/f39/fwBgAn9/AX9gA39/fwF/YAV/f39/fwF/YAZ/f39/f38Bf2AEf39/fABgDX9/f39/f39/f39/f38AYAh/f39/f39/fwBgAn9/AGADf39/AGADf39/AXxgAAF/YAF9AX1gAAF9YAF9AX9gB39/f39/f38Bf2AFf39/f3wAYAd/f39/f39/AAL7BR0DZW52BWFib3J0AAADZW52C19fX3NldEVyck5vAAADZW52Fl9fZW1iaW5kX3JlZ2lzdGVyX2Jvb2wABwNlbnYXX19lbWJpbmRfcmVnaXN0ZXJfY2xhc3MADQNlbnYgX19lbWJpbmRfcmVnaXN0ZXJfY2xhc3NfZnVuY3Rpb24ADgNlbnYXX19lbWJpbmRfcmVnaXN0ZXJfZW12YWwADwNlbnYXX19lbWJpbmRfcmVnaXN0ZXJfZmxvYXQAEANlbnYaX19lbWJpbmRfcmVnaXN0ZXJfZnVuY3Rpb24ABANlbnYZX19lbWJpbmRfcmVnaXN0ZXJfaW50ZWdlcgAHA2Vudh1fX2VtYmluZF9yZWdpc3Rlcl9tZW1vcnlfdmlldwAQA2VudhxfX2VtYmluZF9yZWdpc3Rlcl9zdGRfc3RyaW5nAA8DZW52HV9fZW1iaW5kX3JlZ2lzdGVyX3N0ZF93c3RyaW5nABADZW52Fl9fZW1iaW5kX3JlZ2lzdGVyX3ZvaWQADwNlbnYKX19lbXZhbF9hcwARA2Vudg5fX2VtdmFsX2RlY3JlZgAAA2VudhRfX2VtdmFsX2dldF9wcm9wZXJ0eQAIA2Vudg5fX2VtdmFsX2luY3JlZgAAA2VudhNfX2VtdmFsX25ld19jc3RyaW5nAAUDZW52F19fZW12YWxfcnVuX2Rlc3RydWN0b3JzAAADZW52El9fZW12YWxfdGFrZV92YWx1ZQAIA2VudgZfYWJvcnQABgNlbnYZX2Vtc2NyaXB0ZW5fZ2V0X2hlYXBfc2l6ZQASA2VudhZfZW1zY3JpcHRlbl9tZW1jcHlfYmlnAAkDZW52F19lbXNjcmlwdGVuX3Jlc2l6ZV9oZWFwAAUDZW52F2Fib3J0T25DYW5ub3RHcm93TWVtb3J5AAUDZW52DF9fdGFibGVfYmFzZQN/AANlbnYORFlOQU1JQ1RPUF9QVFIDfwADZW52Bm1lbW9yeQIAgAIDZW52BXRhYmxlAXABSUkDfHsFBgUSAA8PEAAADwYBAAIDAQYFBQAFBAYKDAcLCAUFExMTEhIUBhIICAUVBgYGBgYGBgYGBgYGBgAAAAAAAAYGBgYGBQUIBQAJBAcBCRAQAQgEBwEJCQgICAQHAQEEBwkJBQkCCgsWAA8MFwcEGAUICQIKCwYAAwwBBwQGEAJ/AUGQkwQLfwFBkJPEAgsH/wQoEF9fZ3Jvd1dhc21NZW1vcnkAGRJfX1oxMmNyZWF0ZU1vZHVsZWkALitfX19lbWJpbmRfcmVnaXN0ZXJfbmF0aXZlX2FuZF9idWlsdGluX3R5cGVzAEQRX19fZXJybm9fbG9jYXRpb24APw5fX19nZXRUeXBlTmFtZQBcDF9faG9va19jeWNsZQAgC19faG9va19pbml0AB8KX19ob29rX29mZgAiCV9faG9va19vbgAhDF9faG9va19wYXJhbQAjEF9fb3NjX2JsX3Bhcl9pZHgAOBBfX29zY19ibF9zYXdfaWR4ADkQX19vc2NfYmxfc3FyX2lkeAA6Dl9fb3NjX21jdV9oYXNoADsKX19vc2NfcmFuZAA8C19fb3NjX3doaXRlAD0FX2ZyZWUAYAdfbWFsbG9jAF8HX21lbWNweQB4B19tZW1zZXQAeQ1fb3NjX2FwaV9pbml0AD4FX3NicmsAegpkeW5DYWxsX2lpADULZHluQ2FsbF9paWkAewxkeW5DYWxsX2lpaWkAfA1keW5DYWxsX2lpaWlpAH0OZHluQ2FsbF9paWlpaWkAfg9keW5DYWxsX2lpaWlpaWkAfwlkeW5DYWxsX3YAgAEKZHluQ2FsbF92aQCBAQxkeW5DYWxsX3ZpaWQAggENZHluQ2FsbF92aWlpZACDAQ1keW5DYWxsX3ZpaWlpAIQBDmR5bkNhbGxfdmlpaWlpAIUBD2R5bkNhbGxfdmlpaWlpaQCGARNlc3RhYmxpc2hTdGFja1NwYWNlAB4LZ2xvYmFsQ3RvcnMAGgpzdGFja0FsbG9jABsMc3RhY2tSZXN0b3JlAB0Jc3RhY2tTYXZlABwJaAEAIwALSYcBKywsKywsKywsKzaHAYcBhwGHAYgBNYkBYW1uigEniwExjAE0jQGOASImIiImIiImJiYmLS0tLY8BKJABMpEBKSVkbHSRAZEBkgFja3MzkgGSAZIBkwEvYmpykwGTAZMBCpKyAXsGACAAQAALJAEBfxAkECoQMCMCIQAjAkEQaiQCIABBuIkENgIAEEQgACQCCxsBAX8jAiEBIAAjAmokAiMCQQ9qQXBxJAIgAQsEACMCCwYAIAAkAgsKACAAJAIgASQDCwMAAQvzDQIEfwx9QeyEBC0AACEFQeyEBEEAOgAAIABBBGouAQAiBkH//wNxQQh2IgQiA0GXASADQZcBSRtBAnRB9IsDaioCACIIQwAAAAAgBkH/AXGyQ4GAgDuUQwAAAAAgBEEBakEQdEEQdUH/AXEiA0GXASADQZcBSRtBAnRB9IsDaioCACAIkyIIIAgQQ0EDRhuUIgggCBBDQQNGG5IhCEGAhQQqAgAhCUHIhARB6IQEKgIAQzaV/D4gCEM+w643lCAIQ0n/uMaSQwAAAABgG5IiCDgCAEHMhAQgCUM+w642lCAIkjgCAEHQhAQgCUMXt1E2lCAIQwAAAD+UkjgCACAFQQJxBEBBhIUELAAAIgNB/wFxIQQgA0H/AXFBEEgEf0GgGgUgA0H/AXFBIEgEfyAEQfABakH/AXEhA0Gk3wAFIARB4AFqQf8BcSEDQaSgAQsLIQRBsIQEIANB/wFxQQJ0IARqKAIANgIACyAFQQRxBEBBhYUELAAAIgNB/wFxIQQgA0H/AXFBDUgEf0GU2QEFIANB/wFxQRxIBH8gBEHzAWpB/wFxIQNB/I0CBSAEQeQBakH/AXEhA0H0ygILCyEEQbSEBCADQf8BcUECdCAEaigCADYCAAsgBUEIcQRAQbiEBEGGhQQtAABBAnRBoBpqKAIANgIACyAFQcAAcQRAQbyEBEMAAAAAOAIAQcCEBEMAAAAAOAIAQcSEBEMAAAAAOAIAQdSEBEHYhAQoAgA2AgALQdSEBCAAKAIAskMAAAAwlCIIOAIAIAVBIHEEfUHchARB+IQEKgIAIghDd8yrMpQ4AgBB4IQEQwAAAAAgCEMAAABDlCAIEENBA0YbIgmpIgBBAnRBnBZqKgIAIghDAAAAAEMAAAAAIABBAnRBoBZqKgIAIAiTIgggCBBDQQNGGyAJIACzk5QiCCAIEENBA0YbkiIIOAIAQeSEBEMAAIA/IAiVOAIAQdSEBCoCAAUgCAshB0G8hAQqAgAhC0HAhAQqAgAhDEHEhAQqAgAhCUHYhAQqAgAhCEHwhAQqAgAhDkH0hAQqAgAhDyACRQRAQbyEBCALOAIAQcCEBCAMOAIAQcSEBCAJOAIAQdiEBCAIOAIADwsgByAIkyACs5UhECACQQJ0IAFqIQBDAACAPyAOkyERQwAAgD8gD5MhEgNAQbCEBCgCACEDQwAAgD9DUrh+PyAIQfyEBCoCAJIiB0MK16M7IAdDCteju5JDAAAAAGAbIgcgB0NSuH6/kkMAAAAAYBsiDZNDAAAAACALIAups5MiB0MAAABDlCAHEENBA0YbIgqpIgJB/wBxQQJ0IANqKgIAIgdDAAAAAEMAAAAAIAJBAWpB/wBxQQJ0IANqKgIAIAeTIgcgBxBDQQNGGyAKIAKzk5QiByAHEENBA0YbkpQhB0G0hAQoAgAhAyAHIA1DAAAAACAMIAyps5MiB0MAAABDlCAHEENBA0YbIgqpIgJB/wBxQQJ0IANqKgIAIgdDAAAAAEMAAAAAIAJBAWpB/wBxQQJ0IANqKgIAIAeTIgcgBxBDQQNGGyAKIAKzk5QiByAHEENBA0YbkpSSIQdBuIQEKAIAIQNDAACAPyASIBEgB5QgDkMAAAAAIAkgCamzkyIHQwAAAEOUIAcQQ0EDRhsiCqkiAkH/AHFBAnQgA2oqAgAiB0MAAAAAQwAAAAAgAkEBakH/AHFBAnQgA2oqAgAgB5MiByAHEENBA0YbIAogArOTlCIHIAcQQ0EDRhuSIgqUkiIHlCAPIAogB5SUkiIHQwAAgL8gB0MAAIA/kkMAAAAAYBsiByAHQwAAgL+SQwAAAABgGyENQYiFBCoCACANlCEKQwAAAABBnIUEKgIAIgcgBxBDQQNGGyAKkiEHQZyFBEGMhQQqAgAgDZRBlIUEKgIAIAeUkzgCAEMAAAAAIAcgBxBDQQNGGyEHQdyEBCoCABA9lCAHkiEHQaSFBCoCAEHkhAQqAgBB4IQEKgIAIAeUIgcgB7xBgICAgHhxQYCAgPgDcr6SqLKUIg2UIQpDAAAAAEG4hQQqAgAiByAHEENBA0YbIAqSIQdBuIUEQaiFBCoCACANlEGwhQQqAgAgB5STOAIAIAFDAACAP0MAAAAAIAcgBxBDQQNGGyIHQwAAgL8gB0MAAIA/kkMAAAAAYBsiByAHQwAAgL+SQwAAAABgGyIHIAcgByAHlJRDAAAAPpSTQ////06UqDYCACALQciEBCoCAJIiCyALqbOTIQsgDEHMhAQqAgCSIgwgDKmzkyEMIAlB0IQEKgIAkiIJIAmps5MhCSAQIAiSIQggAUEEaiIBIABHDQALQbyEBCALOAIAQcCEBCAMOAIAQcSEBCAJOAIAQdiEBCAIOAIACxQAQeyEBEHshAQsAABBwAByOgAACwMAAQuYAwEBfQJAAkACQAJAAkACQAJAAkACQCAAQRB0QRB1DggAAQIDBAUGBwgLQYSFBCABQf//A3FBLm86AABB7IQEQeyEBCwAAEECcjoAAA8LQYWFBCABQf//A3FBLG86AABB7IQEQeyEBCwAAEEEcjoAAA8LQYaFBCABQQ9xOgAAQeyEBEHshAQsAABBCHI6AAAPC0HwhARDAACAPyABQf//A3GyQwrXIzyUQ2ZmZj+UQ83MTD2SIgJDAAAAACACQwAAAABgGyICIAJDAACAv5JDAAAAAGAbOAIADwtB9IQEQwAAgD8gAUH//wNxskMK1yM8lCICQwAAAAAgAkMAAAAAYBsiAiACQwAAgL+SQwAAAABgGzgCAA8LQfiEBEMAAIA/IAFB//8DcbJDCtcjPJQiAkMAAAAAIAJDAAAAAGAbIgIgAkMAAIC/kkMAAAAAYBs4AgBB7IQEQeyEBCwAAEEgcjoAAA8LQfyEBCABQf//A3GyQwgggDqUOAIADwtBgIUEIAFB//8DcbJDCCCAOpRDAACAP5I4AgALC+AFAgN/A31BsIQEQaAaKAIAIgA2AgBBtIQEQZTZASgCACICNgIAQbiEBCAANgIAQciEBEPJLxY8OAIAQcyEBEPJLxY8OAIAQdCEBEPJL5Y7OAIAQdiEBEMAAAAAOAIAQdyEBEMAAAAAOAIAQeCEBEGcFigCACIBNgIAQeyEBEEAOgAAQeSEBEMAAIA/IAG+lSIDOAIAQbyEBEMAAAAAOAIAQcCEBEMAAAAAOAIAQcSEBEMAAAAAOAIAQdSEBEEANgIAQeiEBBA9Q4rQizWUOAIAQfCEBEPNzEw9OAIAQfSEBEIANwIAQfyEBEIANwIAQYSFBEEAOwEAQYaFBEEAOgAAQYiFBEIANwIAQZCFBEIANwIAQZiFBEIANwIAQaCFBEIANwIAQaiFBEIANwIAQbCFBEIANwIAQbiFBEIANwIAED1DitCLNZQhBEGwhAQgADYCAEG0hAQgAjYCAEG4hAQgADYCAEG8hARDAAAAADgCAEHAhARDAAAAADgCAEHEhARDAAAAADgCAEHIhARDyS8WPDgCAEHMhARDyS8WPDgCAEHQhARDyS+WOzgCAEHUhARBADYCAEHYhARDAAAAADgCAEHchARDAAAAADgCAEHghAQgATYCAEHkhAQgAzgCAEHohAQgBDgCAEHshARBADoAAEHwhARDzcxMPTgCAEH0hARCADcCAEH8hARCADcCAEGEhQRBADsBAEGGhQRBADoAAEGIhQRDzMxMPjgCAEGUhQRDzcxMvzgCAEGMhQRDAAAAADgCAEGQhQRDAAAAADgCAEGYhQRDAAAAADgCAEMAAAAAQcgVKgIAQcQVKgIAIgSTIgNDAPjQPZQgAxBDQQNGGyEDIARDAAAAACADIAMQQ0EDRhuSIgNDAACAP5IhBEGohQQgAyAElSIFOAIAQaSFBCAFOAIAQbCFBCADQwAAgL+SIASVOAIAQayFBEMAAAAAOAIAQbSFBEMAAAAAOAIACwMAAQsGACAAEGALXwEBfyMCIQQjAkEQaiQCED4gAygCACIDEBAgBCADNgIAIAMQECAAIAE2AgggACACNgIEIAQoAgAQDiADEA4gAEGMBGoiAEIANwIAIABCADcCCCAAQQA6ABAgBCQCQQELjQEAIAFBCEkEQCABQf//A3EgAqpB//8DcRAjDwsCQAJAAkACQAJAIAFB5ABrDgQAAQIDBAsgAEGcBGogAqpBAEciAToAACAAQYwEaiEAIAEEQCAAECEPBQ8LAAsgAEGQBGogAqpBEHRBEHVBCHQ7AQAPCyAAQZIEaiACqjsBAA8LIABBlARqIAKqOwEACwuQAgICfwF9IwIhBCMCQRBqJAIgBEEEaiIDIAEoAgAiATYCACABEBAgAxA3IQEgAygCABAOIABBjARqIgMgASoCACIGu0QAAAAAAADgP6JEAAAAAAAA4D+gtkP///9OlKhBACAGQwAAAABcGzYCACAEIAIoAgAiATYCACABEBAgBBA3IQEgBCgCABAOIABBnARqLAAARQRAIAFBACAAQQhqKAIAQQJ0EHkaIAQkAg8LIAMgAEEMaiAAQQhqIgIoAgAQICACKAIAIgVFBEAgBCQCDwtBACECA0AgAUEEaiEDIAEgAEEMaiACQQJ0aigCALJDAAAAMJQ4AgAgAkEBaiICIAVJBEAgAyEBDAELCyAEJAILgAEAQfAIQZAJQaAJQYAKQbXzA0EBQbXzA0ECQbXzA0EDQbjzA0HH8wNBDBADQYAJQbAJQcAJQfAIQbXzA0EEQbXzA0EFQbXzA0EGQcrzA0HH8wNBDRADQdAJQeAJQfAJQfAIQbXzA0EHQbXzA0EIQbXzA0EJQdrzA0HH8wNBDhADCw0AIAAoAgBBfGooAgALBAAgAAslAQF/IABFBEAPCyAAKAIAQQRqKAIAIQEgACABQQ9xQR1qEQAACyMAIAAEQEEADwtBoAQQXSIAQQBBoAQQeRogAEHwDTYCACAAC4gCAgZ/AXwjAiEIIwJBEGokAiACKAIAQYgKIAhBDGoiAhANIQwgAigCACEJIAyrIgcoAgAhBiAIIgJCADcCACACQQA2AgggBkFvSwRAEBQLIAdBBGohCgJAAkAgBkELSQR/IAIgBjoACyAGBH8gAiEHDAIFIAILBSACIAZBEGpBcHEiCxBdIgc2AgAgAiALQYCAgIB4cjYCCCACIAY2AgQMAQshBwwBCyAHIAogBhB4GgsgBiAHakEAOgAAIAkQEiACQZD1AxBCEF5FBEAgASADIAQgBSABKAIAKAIcQQdxQTFqEQEACyAAQQE2AgAgAiwAC0EATgRAIAgkAg8LIAIoAgAQYCAIJAIL6AEBAX9BgApBqApBuApBAEG18wNBCkGK9gNBAEGK9gNBAEGM9gNBx/MDQQ8QA0EIEF0iAEEINgIAIABBATYCBEGACkGW9gNBBUGACEGb9gNBASAAQQAQBEEIEF0iAEEQNgIAIABBATYCBEGACkGi9gNBBEGgCEGr9gNBASAAQQAQBEEIEF0iAEEUNgIAIABBATYCBEGACkGx9gNBBUGwCEG59gNBBCAAQQAQBEEIEF0iAEEYNgIAIABBATYCBEGACkHA9gNBBkHQCEHK9gNBASAAQQAQBEHS9gNBAkGQDkHe9gNBAUELEAcLZgECfyMCIQUjAkEQaiQCIAAoAgAhBiABIABBBGooAgAiAUEBdWohACABQQFxBEAgBiAAKAIAaigCACEGCyAFIAQ2AgAgACACIAMgBSAGQQFxQRZqEQIAIQAgBSgCABAOIAUkAiAAC1UBAX8gACgCACEEIAEgAEEEaigCACIBQQF1aiEAIAFBAXEEQCAEIAAoAgBqKAIAIQQgACACIAMgBEEBcUEtahEDAAUgACACIAMgBEEBcUEtahEDAAsLiAEBAn8jAiEFIwJBEGokAiAAKAIAIQYgASAAQQRqKAIAIgFBAXVqIQAgAUEBcQRAIAYgACgCAGooAgAhBgsgBUEIaiIBIAI2AgAgBUEEaiICIAM2AgAgBSAENgIAIAAgASACIAUgBkEHcUExahEBACAFKAIAEA4gAigCABAOIAEoAgAQDiAFJAILfgECfyMCIQYjAkEQaiQCIAAoAgAhByABIABBBGooAgAiAUEBdWohACABQQFxBEAgByAAKAIAaigCACEHCyAGIAI2AgAgBkEEaiIBIAAgBiADIAQgBSAHQQdxQcEAahEEACABKAIAEBAgASgCACIAEA4gBigCABAOIAYkAiAACwwAIAEgAEEPcREFAAsGACAAEC4LigEBBH8jAiEDIwJBEGokAiAAKAIAQZr3AxARIgEQDyEEIAEQDiAEQagNIAMiARANqiECIAEoAgAQEiAEEA4gAkEASARAIAMkAkEADwsgACgCACEAIAFBADYCACAAQagNIAEQEyICEA8hACACEA4gAEGoDSABEA2qIQIgASgCABASIAAQDiADJAIgAgvaAQEDf0MAAMBAIABBsNUDLAAAIgFB/wFxsiAAYAR/QQAFQbHVAywAACIBQf8BcbIgAGAEf0EBBUGy1QMsAAAiAUH/AXGyIABgBH9BAgVBs9UDLAAAIgFB/wFxsiAAYAR/QQMFQbTVAywAACIBQf8BcbIgAGAEf0EEBUG11QMsAAAiAUH/AXGyIABgBH9BBQVBttUDLAAAIQFBBgsLCwsLIgJBr9UDaiwAAAsiA0H/AXGykyABQf8BcSADQf8BcWuylSACQf8BcbKSIgAgAEMAAMDAkkMAAAAAYBsL2gEBA39DAADAQCAAQeicAywAACIBQf8BcbIgAGAEf0EABUHpnAMsAAAiAUH/AXGyIABgBH9BAQVB6pwDLAAAIgFB/wFxsiAAYAR/QQIFQeucAywAACIBQf8BcbIgAGAEf0EDBUHsnAMsAAAiAUH/AXGyIABgBH9BBAVB7ZwDLAAAIgFB/wFxsiAAYAR/QQUFQe6cAywAACEBQQYLCwsLCyICQeecA2osAAALIgNB/wFxspMgAUH/AXEgA0H/AXFrspUgAkH/AXGykiIAIABDAADAwJJDAAAAAGAbC9oBAQN/QwAAwEAgAEGMuQMsAAAiAUH/AXGyIABgBH9BAAVBjbkDLAAAIgFB/wFxsiAAYAR/QQEFQY65AywAACIBQf8BcbIgAGAEf0ECBUGPuQMsAAAiAUH/AXGyIABgBH9BAwVBkLkDLAAAIgFB/wFxsiAAYAR/QQQFQZG5AywAACIBQf8BcbIgAGAEf0EFBUGSuQMsAAAhAUEGCwsLCwsiAkGLuQNqLAAACyIDQf8BcbKTIAFB/wFxIANB/wFxa7KVIAJB/wFxspIiACAAQwAAwMCSQwAAAABgGwsJAEHAhQQoAgALVAECf0HckAMoAgAiAUEQdiEAQdyQAyABQf//A3FBp4MBbCAAQYCAnI0EbEGAgPz/B3FqIABBp4MBbEEPdmoiAEH/////B3EgAEEfdmoiADYCACAAC80DAgJ/An1B3JADKAIAIgFBEHYhACABQf//A3FBp4MBbCAAQYCAnI0EbEGAgPz/B3FqIABBp4MBbEEPdmoiAEH/////B3EgAEEfdmoiAEEQdiEBQdyQAyAAQf//A3FBp4MBbCABQYCAnI0EbEGAgPz/B3FqIAFBp4MBbEEPdmoiAUH/////B3EgAUEfdmoiATYCAEMAAAAAQ1K4fj8gALNDAACAL5QiAkMK16M7IAJDCteju5JDAAAAAGAbIgJDCteju5IgAkMAAIC/kkMAAAAAYBsiAkOqpIA/lEMAAIBDlCACEENBA0YbIgKpIgBBAnRB4JADaioCACIDQwAAAABDAAAAACAAQQJ0QeSQA2oqAgAgA5MiAyADEENBA0YbIAIgALOTlCICIAIQQ0EDRhuSQwAAAAAgAbNDAACAL5RDAACAPpIiAiACqbOTIgJDAAAAQJRDAAAAQ5QgAhBDQQNGGyICqSIAQf8AcUECdEHkmANqKgIAIgNDAAAAAEMAAAAAIABBAWpB/wBxQQJ0QeSYA2oqAgAgA5MiAyADEENBA0YbIAIgALOTlCICIAIQQ0EDRhuSIgIgAowgAEGAAUkblEOamZk+lEMAAAAAkgvWAwEDf0HckAMoAgAiAUEQdiEAIAFB//8DcUGngwFsIABBgICcjQRsQYCA/P8HcWogAEGngwFsQQ92aiIAQf////8HcSAAQR92aiIAQZa61fYHaiAAQQx0aiIBQRN2IAFBvISHu3xzcyIBQbHP2bIBaiABQQV0aiIBQezIiZ19aiABQQl0cyIBQcWNwWtqIAFBA3RqIQEgAEH//wNxQaeDAWwgAEEQdiIAQYCAnI0EbEGAgPz/B3FqIABBp4MBbEEPdmoiAEH/////B3EgAEEfdmoiAEGWutX2B2ogAEEMdGoiAkETdiACQbyEh7t8c3MiAkGxz9myAWogAkEFdGoiAkHsyImdfWogAkEJdHMiAkHFjcFraiACQQN0aiECQcCFBCAAQf//A3FBp4MBbCAAQRB2IgBBgICcjQRsQYCA/P8HcWogAEGngwFsQQ92aiIAQf////8HcSAAQR92aiIAQZa61fYHaiAAQQx0aiIAQRN2IABBvISHu3xzcyIAQbHP2bIBaiAAQQV0aiIAQezIiZ19aiAAQQl0cyIAQcWNwWtqIABBA3RqIgBBEHYgACACIAFBiZ7pqntzIAFBEHZzcyACQRB2c3NzIgA2AgBB3JADIAA2AgALBgBBxIUEC1wBAn8gACwAACICIAEsAAAiA0cgAkVyBH8gAiEBIAMFA38gAEEBaiIALAAAIgIgAUEBaiIBLAAAIgNHIAJFcgR/IAIhASADBQwBCwsLIQAgAUH/AXEgAEH/AXFrC1QBA39BkPUDIQIgAQR/An8DQCAALAAAIgMgAiwAACIERgRAIABBAWohACACQQFqIQJBACABQX9qIgFFDQIaDAELCyADQf8BcSAEQf8BcWsLBUEACwuOAQEDfwJAAkAgACICQQNxRQ0AIAIhAQNAAkAgACwAAEUEQCABIQAMAQsgAEEBaiIAIgFBA3ENAQwCCwsMAQsDQCAAQQRqIQEgACgCACIDQYCBgoR4cUGAgYKEeHMgA0H//ft3anFFBEAgASEADAELCyADQf8BcQRAA0AgAEEBaiIALAAADQALCwsgACACawtHAQF/An8CQAJAAkAgALwiAUEXdkH/AXFBGHRBGHVBf2sOAgEAAgtBA0ECIAFB/////wdxGwwCCyABQf///wNxRQwBC0EECwuqAQBB6AxBofcDEAxB+AxBpvcDQQFBAUEAEAIQRRBGEEcQSBBJEEoQSxBMEE0QThBPQYgKQZD4AxAKQcgLQZz4AxAKQbALQQRBvfgDEAtByApByvgDEAUQUEH4+AMQUUGd+QMQUkHE+QMQU0Hj+QMQVEGL+gMQVUGo+gMQVhBXEFhBk/sDEFFBs/sDEFJB1PsDEFNB9fsDEFRBl/wDEFVBuPwDEFYQWRBaEFsLLgEBfyMCIQAjAkEQaiQCIABBq/cDNgIAQYANIAAoAgBBAUGAf0H/ABAIIAAkAgsuAQF/IwIhACMCQRBqJAIgAEGw9wM2AgBBkA0gACgCAEEBQYB/Qf8AEAggACQCCy0BAX8jAiEAIwJBEGokAiAAQbz3AzYCAEGIDSAAKAIAQQFBAEH/ARAIIAAkAgswAQF/IwIhACMCQRBqJAIgAEHK9wM2AgBBmA0gACgCAEECQYCAfkH//wEQCCAAJAILLgEBfyMCIQAjAkEQaiQCIABB0PcDNgIAQaANIAAoAgBBAkEAQf//AxAIIAAkAgs0AQF/IwIhACMCQRBqJAIgAEHf9wM2AgBBqA0gACgCAEEEQYCAgIB4Qf////8HEAggACQCCywBAX8jAiEAIwJBEGokAiAAQeP3AzYCAEGwDSAAKAIAQQRBAEF/EAggACQCCzQBAX8jAiEAIwJBEGokAiAAQfD3AzYCAEG4DSAAKAIAQQRBgICAgHhB/////wcQCCAAJAILLAEBfyMCIQAjAkEQaiQCIABB9fcDNgIAQcANIAAoAgBBBEEAQX8QCCAAJAILKAEBfyMCIQAjAkEQaiQCIABBg/gDNgIAQcgNIAAoAgBBBBAGIAAkAgsoAQF/IwIhACMCQRBqJAIgAEGJ+AM2AgBB0A0gACgCAEEIEAYgACQCCygBAX8jAiEAIwJBEGokAiAAQdr4AzYCAEGoC0EAIAAoAgAQCSAAJAILJgEBfyMCIQEjAkEQaiQCIAEgADYCAEGgC0EAIAEoAgAQCSABJAILJgEBfyMCIQEjAkEQaiQCIAEgADYCAEGYC0EBIAEoAgAQCSABJAILJgEBfyMCIQEjAkEQaiQCIAEgADYCAEGQC0ECIAEoAgAQCSABJAILJgEBfyMCIQEjAkEQaiQCIAEgADYCAEGIC0EDIAEoAgAQCSABJAILJgEBfyMCIQEjAkEQaiQCIAEgADYCAEGAC0EEIAEoAgAQCSABJAILJgEBfyMCIQEjAkEQaiQCIAEgADYCAEH4CkEFIAEoAgAQCSABJAILKAEBfyMCIQAjAkEQaiQCIABBzvoDNgIAQfAKQQQgACgCABAJIAAkAgsoAQF/IwIhACMCQRBqJAIgAEHs+gM2AgBB6ApBBSAAKAIAEAkgACQCCygBAX8jAiEAIwJBEGokAiAAQdr8AzYCAEHgCkEGIAAoAgAQCSAAJAILKAEBfyMCIQAjAkEQaiQCIABB+fwDNgIAQdgKQQcgACgCABAJIAAkAgsoAQF/IwIhACMCQRBqJAIgAEGZ/QM2AgBB0ApBByAAKAIAEAkgACQCC1ABA38jAiEBIwJBEGokAiABIAA2AgAgAUEEaiIAIAEoAgA2AgAgACgCACgCBCIAEEJBAWoiAhBfIgMEfyADIAAgAhB4BUEACyEAIAEkAiAACxUAIABBASAAGxBfIgAEfyAABUEACwtzAQN/IAFBf0YgACwACyICQQBIIgMEfyAAKAIEBSACQf8BcQsiAkEASXIEQBAUCyADBEAgACgCACEACyACQX8gAkF/SRsiAyABSyECIAEgAyACGyIEBH8gACAEEEEFQQALIgAEfyAABUF/IAIgAyABSRsLC543AQx/IwIhCiMCQRBqJAIgAEH1AUkEf0HIhQQoAgAiA0EQIABBC2pBeHEgAEELSRsiAkEDdiIAdiIBQQNxBEAgAUEBcUEBcyAAaiIAQQN0QfCFBGoiAUEIaiIGKAIAIgJBCGoiBSgCACIEIAFGBEBByIUEIANBASAAdEF/c3E2AgAFIAQgATYCDCAGIAQ2AgALIAIgAEEDdCIAQQNyNgIEIAAgAmpBBGoiACAAKAIAQQFyNgIAIAokAiAFDwsgAkHQhQQoAgAiB0sEfyABBEBBAiAAdCIEQQAgBGtyIAEgAHRxIgBBACAAa3FBf2oiAEEMdkEQcSIBIAAgAXYiAEEFdkEIcSIBciAAIAF2IgBBAnZBBHEiAXIgACABdiIAQQF2QQJxIgFyIAAgAXYiAEEBdkEBcSIBciAAIAF2aiIEQQN0QfCFBGoiAEEIaiIFKAIAIgFBCGoiCCgCACIGIABGBEBByIUEIANBASAEdEF/c3EiADYCAAUgBiAANgIMIAUgBjYCACADIQALIAEgAkEDcjYCBCABIAJqIgYgBEEDdCIEIAJrIgNBAXI2AgQgASAEaiADNgIAIAcEQEHchQQoAgAhAiAHQQN2IgRBA3RB8IUEaiEBIABBASAEdCIEcQR/IAFBCGoiACEEIAAoAgAFQciFBCAAIARyNgIAIAFBCGohBCABCyEAIAQgAjYCACAAIAI2AgwgAiAANgIIIAIgATYCDAtB0IUEIAM2AgBB3IUEIAY2AgAgCiQCIAgPC0HMhQQoAgAiCwR/IAtBACALa3FBf2oiAEEMdkEQcSIBIAAgAXYiAEEFdkEIcSIBciAAIAF2IgBBAnZBBHEiAXIgACABdiIAQQF2QQJxIgFyIAAgAXYiAEEBdkEBcSIBciAAIAF2akECdEH4hwRqKAIAIgAoAgRBeHEgAmshCCAAIQUDQAJAIAAoAhAiAQRAIAEhAAUgACgCFCIARQ0BCyAAKAIEQXhxIAJrIgQgCEkhASAEIAggARshCCAAIAUgARshBQwBCwsgAiAFaiIMIAVLBH8gBSgCGCEJIAUoAgwiACAFRgRAAkAgBUEUaiIBKAIAIgBFBEAgBUEQaiIBKAIAIgBFBEBBACEADAILCwNAAkAgAEEUaiIEKAIAIgYEfyAEIQEgBgUgAEEQaiIEKAIAIgZFDQEgBCEBIAYLIQAMAQsLIAFBADYCAAsFIAUoAggiASAANgIMIAAgATYCCAsgCQRAAkAgBSgCHCIBQQJ0QfiHBGoiBCgCACAFRgRAIAQgADYCACAARQRAQcyFBCALQQEgAXRBf3NxNgIADAILBSAJQRBqIgEgCUEUaiABKAIAIAVGGyAANgIAIABFDQELIAAgCTYCGCAFKAIQIgEEQCAAIAE2AhAgASAANgIYCyAFKAIUIgEEQCAAIAE2AhQgASAANgIYCwsLIAhBEEkEQCAFIAIgCGoiAEEDcjYCBCAAIAVqQQRqIgAgACgCAEEBcjYCAAUgBSACQQNyNgIEIAwgCEEBcjYCBCAIIAxqIAg2AgAgBwRAQdyFBCgCACECIAdBA3YiAUEDdEHwhQRqIQAgA0EBIAF0IgFxBH8gAEEIaiIBIQMgASgCAAVByIUEIAEgA3I2AgAgAEEIaiEDIAALIQEgAyACNgIAIAEgAjYCDCACIAE2AgggAiAANgIMC0HQhQQgCDYCAEHchQQgDDYCAAsgCiQCIAVBCGoPBSACCwUgAgsFIAILBSAAQb9/SwR/QX8FAn8gAEELaiIAQXhxIQFBzIUEKAIAIgQEfyAAQQh2IgAEfyABQf///wdLBH9BHwUgACAAQYD+P2pBEHZBCHEiA3QiAkGA4B9qQRB2QQRxIQAgAUEOIAIgAHQiBkGAgA9qQRB2QQJxIgIgACADcnJrIAYgAnRBD3ZqIgBBB2p2QQFxIABBAXRyCwVBAAshB0EAIAFrIQICQAJAIAdBAnRB+IcEaigCACIABEAgAUEAQRkgB0EBdmsgB0EfRht0IQZBACEDA0AgACgCBEF4cSABayIIIAJJBEAgCAR/IAAhAyAIBUEAIQMgACECDAQLIQILIAUgACgCFCIFIAVFIAUgAEEQaiAGQR92QQJ0aigCACIIRnIbIQAgBkEBdCEGIAgEQCAAIQUgCCEADAELCwVBACEAQQAhAwsgACADcgR/IAAhBiADBSABIARBAiAHdCIAQQAgAGtycSIARQ0EGiAAQQAgAGtxQX9qIgBBDHZBEHEiAyAAIAN2IgBBBXZBCHEiA3IgACADdiIAQQJ2QQRxIgNyIAAgA3YiAEEBdkECcSIDciAAIAN2IgBBAXZBAXEiA3IgACADdmpBAnRB+IcEaigCACEGQQALIQAgBgR/IAIhAyAGIQIMAQUgACEGIAILIQMMAQsgACEGA0AgAigCBEF4cSABayIIIANJIQUgCCADIAUbIQMgAiAGIAUbIQYgAigCECIARQRAIAIoAhQhAAsgAARAIAAhAgwBCwsLIAYEfyADQdCFBCgCACABa0kEfyABIAZqIgcgBksEfyAGKAIYIQkgBigCDCIAIAZGBEACQCAGQRRqIgIoAgAiAEUEQCAGQRBqIgIoAgAiAEUEQEEAIQAMAgsLA0ACQCAAQRRqIgUoAgAiCAR/IAUhAiAIBSAAQRBqIgUoAgAiCEUNASAFIQIgCAshAAwBCwsgAkEANgIACwUgBigCCCICIAA2AgwgACACNgIICyAJBEACQCAGKAIcIgJBAnRB+IcEaiIFKAIAIAZGBEAgBSAANgIAIABFBEBBzIUEIARBASACdEF/c3EiADYCAAwCCwUgCUEQaiICIAlBFGogAigCACAGRhsgADYCACAARQRAIAQhAAwCCwsgACAJNgIYIAYoAhAiAgRAIAAgAjYCECACIAA2AhgLIAYoAhQiAgR/IAAgAjYCFCACIAA2AhggBAUgBAshAAsFIAQhAAsgA0EQSQRAIAYgASADaiIAQQNyNgIEIAAgBmpBBGoiACAAKAIAQQFyNgIABQJAIAYgAUEDcjYCBCAHIANBAXI2AgQgAyAHaiADNgIAIANBA3YhASADQYACSQRAIAFBA3RB8IUEaiEAQciFBCgCACICQQEgAXQiAXEEfyAAQQhqIgEhAiABKAIABUHIhQQgASACcjYCACAAQQhqIQIgAAshASACIAc2AgAgASAHNgIMIAcgATYCCCAHIAA2AgwMAQsgA0EIdiIBBH8gA0H///8HSwR/QR8FIAEgAUGA/j9qQRB2QQhxIgR0IgJBgOAfakEQdkEEcSEBIANBDiACIAF0IgVBgIAPakEQdkECcSICIAEgBHJyayAFIAJ0QQ92aiIBQQdqdkEBcSABQQF0cgsFQQALIgFBAnRB+IcEaiECIAcgATYCHCAHQRBqIgRBADYCBCAEQQA2AgAgAEEBIAF0IgRxRQRAQcyFBCAAIARyNgIAIAIgBzYCACAHIAI2AhggByAHNgIMIAcgBzYCCAwBCyACKAIAIgAoAgRBeHEgA0YEQCAAIQEFAkAgA0EAQRkgAUEBdmsgAUEfRht0IQIDQCAAQRBqIAJBH3ZBAnRqIgQoAgAiAQRAIAJBAXQhAiABKAIEQXhxIANGDQIgASEADAELCyAEIAc2AgAgByAANgIYIAcgBzYCDCAHIAc2AggMAgsLIAFBCGoiACgCACICIAc2AgwgACAHNgIAIAcgAjYCCCAHIAE2AgwgB0EANgIYCwsgCiQCIAZBCGoPBSABCwUgAQsFIAELBSABCwsLCyEAQdCFBCgCACICIABPBEBB3IUEKAIAIQEgAiAAayIDQQ9LBEBB3IUEIAAgAWoiBDYCAEHQhQQgAzYCACAEIANBAXI2AgQgASACaiADNgIAIAEgAEEDcjYCBAVB0IUEQQA2AgBB3IUEQQA2AgAgASACQQNyNgIEIAEgAmpBBGoiACAAKAIAQQFyNgIACyAKJAIgAUEIag8LQdSFBCgCACICIABLBEBB1IUEIAIgAGsiAjYCAEHghQRB4IUEKAIAIgEgAGoiAzYCACADIAJBAXI2AgQgASAAQQNyNgIEIAokAiABQQhqDwsgCiEBQaCJBCgCAAR/QaiJBCgCAAVBqIkEQYAgNgIAQaSJBEGAIDYCAEGsiQRBfzYCAEGwiQRBfzYCAEG0iQRBADYCAEGEiQRBADYCAEGgiQQgAUFwcUHYqtWqBXM2AgBBgCALIgEgAEEvaiIGaiIFQQAgAWsiCHEiBCAATQRAIAokAkEADwtBgIkEKAIAIgEEQEH4iAQoAgAiAyAEaiIHIANNIAcgAUtyBEAgCiQCQQAPCwsgAEEwaiEHAkACQEGEiQQoAgBBBHEEQEEAIQIFAkACQAJAQeCFBCgCACIBRQ0AQYiJBCEDA0ACQCADKAIAIgkgAU0EQCAJIAMoAgRqIAFLDQELIAMoAggiAw0BDAILCyAFIAJrIAhxIgJB/////wdJBEAgAhB6IQEgASADKAIAIAMoAgRqRw0CIAFBf0cNBQVBACECCwwCC0EAEHoiAUF/RgR/QQAFQfiIBCgCACIFIAFBpIkEKAIAIgJBf2oiA2pBACACa3EgAWtBACABIANxGyAEaiICaiEDIAJB/////wdJIAIgAEtxBH9BgIkEKAIAIggEQCADIAVNIAMgCEtyBEBBACECDAULCyABIAIQeiIDRg0FIAMhAQwCBUEACwshAgwBCyABQX9HIAJB/////wdJcSAHIAJLcUUEQCABQX9GBEBBACECDAIFDAQLAAtBqIkEKAIAIgMgBiACa2pBACADa3EiA0H/////B08NAkEAIAJrIQYgAxB6QX9GBH8gBhB6GkEABSACIANqIQIMAwshAgtBhIkEQYSJBCgCAEEEcjYCAAsgBEH/////B0kEQCAEEHohAUEAEHoiAyABayIGIABBKGpLIQQgBiACIAQbIQIgBEEBcyABQX9GciABQX9HIANBf0dxIAEgA0lxQQFzckUNAQsMAQtB+IgEQfiIBCgCACACaiIDNgIAIANB/IgEKAIASwRAQfyIBCADNgIAC0HghQQoAgAiBARAAkBBiIkEIQMCQAJAA0AgAygCACIGIAMoAgQiBWogAUYNASADKAIIIgMNAAsMAQsgA0EEaiEIIAMoAgxBCHFFBEAgBiAETSABIARLcQRAIAggAiAFajYCACAEQQAgBEEIaiIBa0EHcUEAIAFBB3EbIgNqIQFB1IUEKAIAIAJqIgYgA2shAkHghQQgATYCAEHUhQQgAjYCACABIAJBAXI2AgQgBCAGakEoNgIEQeSFBEGwiQQoAgA2AgAMAwsLCyABQdiFBCgCAEkEQEHYhQQgATYCAAsgASACaiEGQYiJBCEDAkACQANAIAMoAgAgBkYNASADKAIIIgMNAAsMAQsgAygCDEEIcUUEQCADIAE2AgAgA0EEaiIDIAMoAgAgAmo2AgBBACABQQhqIgJrQQdxQQAgAkEHcRsgAWoiByAAaiEFIAZBACAGQQhqIgFrQQdxQQAgAUEHcRtqIgIgB2sgAGshAyAHIABBA3I2AgQgAiAERgRAQdSFBEHUhQQoAgAgA2oiADYCAEHghQQgBTYCACAFIABBAXI2AgQFAkBB3IUEKAIAIAJGBEBB0IUEQdCFBCgCACADaiIANgIAQdyFBCAFNgIAIAUgAEEBcjYCBCAAIAVqIAA2AgAMAQsgAigCBCIJQQNxQQFGBEAgCUEDdiEEIAlBgAJJBEAgAigCCCIAIAIoAgwiAUYEQEHIhQRByIUEKAIAQQEgBHRBf3NxNgIABSAAIAE2AgwgASAANgIICwUCQCACKAIYIQggAigCDCIAIAJGBEACQCACQRBqIgFBBGoiBCgCACIABEAgBCEBBSABKAIAIgBFBEBBACEADAILCwNAAkAgAEEUaiIEKAIAIgYEfyAEIQEgBgUgAEEQaiIEKAIAIgZFDQEgBCEBIAYLIQAMAQsLIAFBADYCAAsFIAIoAggiASAANgIMIAAgATYCCAsgCEUNACACKAIcIgFBAnRB+IcEaiIEKAIAIAJGBEACQCAEIAA2AgAgAA0AQcyFBEHMhQQoAgBBASABdEF/c3E2AgAMAgsFIAhBEGoiASAIQRRqIAEoAgAgAkYbIAA2AgAgAEUNAQsgACAINgIYIAJBEGoiBCgCACIBBEAgACABNgIQIAEgADYCGAsgBCgCBCIBRQ0AIAAgATYCFCABIAA2AhgLCyACIAlBeHEiAGohAiAAIANqIQMLIAJBBGoiACAAKAIAQX5xNgIAIAUgA0EBcjYCBCADIAVqIAM2AgAgA0EDdiEBIANBgAJJBEAgAUEDdEHwhQRqIQBByIUEKAIAIgJBASABdCIBcQR/IABBCGoiASECIAEoAgAFQciFBCABIAJyNgIAIABBCGohAiAACyEBIAIgBTYCACABIAU2AgwgBSABNgIIIAUgADYCDAwBCyADQQh2IgAEfyADQf///wdLBH9BHwUgACAAQYD+P2pBEHZBCHEiAnQiAUGA4B9qQRB2QQRxIQAgA0EOIAEgAHQiBEGAgA9qQRB2QQJxIgEgACACcnJrIAQgAXRBD3ZqIgBBB2p2QQFxIABBAXRyCwVBAAsiAUECdEH4hwRqIQAgBSABNgIcIAVBEGoiAkEANgIEIAJBADYCAEHMhQQoAgAiAkEBIAF0IgRxRQRAQcyFBCACIARyNgIAIAAgBTYCACAFIAA2AhggBSAFNgIMIAUgBTYCCAwBCyAAKAIAIgAoAgRBeHEgA0YEQCAAIQEFAkAgA0EAQRkgAUEBdmsgAUEfRht0IQIDQCAAQRBqIAJBH3ZBAnRqIgQoAgAiAQRAIAJBAXQhAiABKAIEQXhxIANGDQIgASEADAELCyAEIAU2AgAgBSAANgIYIAUgBTYCDCAFIAU2AggMAgsLIAFBCGoiACgCACICIAU2AgwgACAFNgIAIAUgAjYCCCAFIAE2AgwgBUEANgIYCwsgCiQCIAdBCGoPCwtBiIkEIQMDQAJAIAMoAgAiBiAETQRAIAYgAygCBGoiBSAESw0BCyADKAIIIQMMAQsLIARBACAFQVFqIgZBCGoiA2tBB3FBACADQQdxGyAGaiIDIAMgBEEQaiIHSRsiA0EIaiEGQeCFBEEAIAFBCGoiCGtBB3FBACAIQQdxGyIIIAFqIgk2AgBB1IUEIAJBWGoiCyAIayIINgIAIAkgCEEBcjYCBCABIAtqQSg2AgRB5IUEQbCJBCgCADYCACADQQRqIghBGzYCACAGQYiJBCkCADcCACAGQZCJBCkCADcCCEGIiQQgATYCAEGMiQQgAjYCAEGUiQRBADYCAEGQiQQgBjYCACADQRhqIQEDQCABQQRqIgJBBzYCACABQQhqIAVJBEAgAiEBDAELCyADIARHBEAgCCAIKAIAQX5xNgIAIAQgAyAEayIGQQFyNgIEIAMgBjYCACAGQQN2IQIgBkGAAkkEQCACQQN0QfCFBGohAUHIhQQoAgAiA0EBIAJ0IgJxBH8gAUEIaiICIQMgAigCAAVByIUEIAIgA3I2AgAgAUEIaiEDIAELIQIgAyAENgIAIAIgBDYCDCAEIAI2AgggBCABNgIMDAILIAZBCHYiAQR/IAZB////B0sEf0EfBSABIAFBgP4/akEQdkEIcSIDdCICQYDgH2pBEHZBBHEhASAGQQ4gAiABdCIFQYCAD2pBEHZBAnEiAiABIANycmsgBSACdEEPdmoiAUEHanZBAXEgAUEBdHILBUEACyICQQJ0QfiHBGohASAEIAI2AhwgBEEANgIUIAdBADYCAEHMhQQoAgAiA0EBIAJ0IgVxRQRAQcyFBCADIAVyNgIAIAEgBDYCACAEIAE2AhggBCAENgIMIAQgBDYCCAwCCyABKAIAIgEoAgRBeHEgBkYEQCABIQIFAkAgBkEAQRkgAkEBdmsgAkEfRht0IQMDQCABQRBqIANBH3ZBAnRqIgUoAgAiAgRAIANBAXQhAyACKAIEQXhxIAZGDQIgAiEBDAELCyAFIAQ2AgAgBCABNgIYIAQgBDYCDCAEIAQ2AggMAwsLIAJBCGoiASgCACIDIAQ2AgwgASAENgIAIAQgAzYCCCAEIAI2AgwgBEEANgIYCwsFQdiFBCgCACIDRSABIANJcgRAQdiFBCABNgIAC0GIiQQgATYCAEGMiQQgAjYCAEGUiQRBADYCAEHshQRBoIkEKAIANgIAQeiFBEF/NgIAQfyFBEHwhQQ2AgBB+IUEQfCFBDYCAEGEhgRB+IUENgIAQYCGBEH4hQQ2AgBBjIYEQYCGBDYCAEGIhgRBgIYENgIAQZSGBEGIhgQ2AgBBkIYEQYiGBDYCAEGchgRBkIYENgIAQZiGBEGQhgQ2AgBBpIYEQZiGBDYCAEGghgRBmIYENgIAQayGBEGghgQ2AgBBqIYEQaCGBDYCAEG0hgRBqIYENgIAQbCGBEGohgQ2AgBBvIYEQbCGBDYCAEG4hgRBsIYENgIAQcSGBEG4hgQ2AgBBwIYEQbiGBDYCAEHMhgRBwIYENgIAQciGBEHAhgQ2AgBB1IYEQciGBDYCAEHQhgRByIYENgIAQdyGBEHQhgQ2AgBB2IYEQdCGBDYCAEHkhgRB2IYENgIAQeCGBEHYhgQ2AgBB7IYEQeCGBDYCAEHohgRB4IYENgIAQfSGBEHohgQ2AgBB8IYEQeiGBDYCAEH8hgRB8IYENgIAQfiGBEHwhgQ2AgBBhIcEQfiGBDYCAEGAhwRB+IYENgIAQYyHBEGAhwQ2AgBBiIcEQYCHBDYCAEGUhwRBiIcENgIAQZCHBEGIhwQ2AgBBnIcEQZCHBDYCAEGYhwRBkIcENgIAQaSHBEGYhwQ2AgBBoIcEQZiHBDYCAEGshwRBoIcENgIAQaiHBEGghwQ2AgBBtIcEQaiHBDYCAEGwhwRBqIcENgIAQbyHBEGwhwQ2AgBBuIcEQbCHBDYCAEHEhwRBuIcENgIAQcCHBEG4hwQ2AgBBzIcEQcCHBDYCAEHIhwRBwIcENgIAQdSHBEHIhwQ2AgBB0IcEQciHBDYCAEHchwRB0IcENgIAQdiHBEHQhwQ2AgBB5IcEQdiHBDYCAEHghwRB2IcENgIAQeyHBEHghwQ2AgBB6IcEQeCHBDYCAEH0hwRB6IcENgIAQfCHBEHohwQ2AgBB4IUEQQAgAUEIaiIDa0EHcUEAIANBB3EbIgMgAWoiBDYCAEHUhQQgAkFYaiICIANrIgM2AgAgBCADQQFyNgIEIAEgAmpBKDYCBEHkhQRBsIkEKAIANgIAC0HUhQQoAgAiASAASwRAQdSFBCABIABrIgI2AgBB4IUEQeCFBCgCACIBIABqIgM2AgAgAyACQQFyNgIEIAEgAEEDcjYCBCAKJAIgAUEIag8LC0HEhQRBDDYCACAKJAJBAAvrDwEJfyAARQRADwtB2IUEKAIAIQQgAEF4aiIBIABBfGooAgAiAEF4cSIDaiEGIABBAXEEfyABIQIgAwUCfyABKAIAIQIgAEEDcUUEQA8LIAEgAmsiACAESQRADwsgAiADaiEDQdyFBCgCACAARgRAIAZBBGoiASgCACICQQNxQQNHBEAgACEBIAAhAiADDAILQdCFBCADNgIAIAEgAkF+cTYCACAAQQRqIANBAXI2AgAgACADaiADNgIADwsgAkEDdiEEIAJBgAJJBEAgAEEIaigCACIBIABBDGooAgAiAkYEQEHIhQRByIUEKAIAQQEgBHRBf3NxNgIAIAAhASAAIQIgAwwCBSABQQxqIAI2AgAgAkEIaiABNgIAIAAhASAAIQIgAwwCCwALIABBGGooAgAhByAAQQxqKAIAIgEgAEYEQAJAIABBEGoiAkEEaiIEKAIAIgEEQCAEIQIFIAIoAgAiAUUEQEEAIQEMAgsLA0ACQCABQRRqIgQoAgAiBQR/IAQhAiAFBSABQRBqIgQoAgAiBUUNASAEIQIgBQshAQwBCwsgAkEANgIACwUgAEEIaigCACICQQxqIAE2AgAgAUEIaiACNgIACyAHBH8gAEEcaigCACICQQJ0QfiHBGoiBCgCACAARgRAIAQgATYCACABRQRAQcyFBEHMhQQoAgBBASACdEF/c3E2AgAgACEBIAAhAiADDAMLBSAHQRBqIgIgB0EUaiACKAIAIABGGyABNgIAIAFFBEAgACEBIAAhAiADDAMLCyABQRhqIAc2AgAgAEEQaiIEKAIAIgIEQCABQRBqIAI2AgAgAkEYaiABNgIACyAEQQRqKAIAIgIEfyABQRRqIAI2AgAgAkEYaiABNgIAIAAhASAAIQIgAwUgACEBIAAhAiADCwUgACEBIAAhAiADCwsLIQAgASAGTwRADwsgBkEEaiIDKAIAIghBAXFFBEAPCyAIQQJxBEAgAyAIQX5xNgIAIAJBBGogAEEBcjYCACAAIAFqIAA2AgAgACEDBUHghQQoAgAgBkYEQEHUhQRB1IUEKAIAIABqIgA2AgBB4IUEIAI2AgAgAkEEaiAAQQFyNgIAIAJB3IUEKAIARwRADwtB3IUEQQA2AgBB0IUEQQA2AgAPC0HchQQoAgAgBkYEQEHQhQRB0IUEKAIAIABqIgA2AgBB3IUEIAE2AgAgAkEEaiAAQQFyNgIAIAAgAWogADYCAA8LIAhBA3YhBSAIQYACSQRAIAZBCGooAgAiAyAGQQxqKAIAIgRGBEBByIUEQciFBCgCAEEBIAV0QX9zcTYCAAUgA0EMaiAENgIAIARBCGogAzYCAAsFAkAgBkEYaigCACEJIAZBDGooAgAiAyAGRgRAAkAgBkEQaiIEQQRqIgUoAgAiAwRAIAUhBAUgBCgCACIDRQRAQQAhAwwCCwsDQAJAIANBFGoiBSgCACIHBH8gBSEEIAcFIANBEGoiBSgCACIHRQ0BIAUhBCAHCyEDDAELCyAEQQA2AgALBSAGQQhqKAIAIgRBDGogAzYCACADQQhqIAQ2AgALIAkEQCAGQRxqKAIAIgRBAnRB+IcEaiIFKAIAIAZGBEAgBSADNgIAIANFBEBBzIUEQcyFBCgCAEEBIAR0QX9zcTYCAAwDCwUgCUEQaiIEIAlBFGogBCgCACAGRhsgAzYCACADRQ0CCyADQRhqIAk2AgAgBkEQaiIFKAIAIgQEQCADQRBqIAQ2AgAgBEEYaiADNgIACyAFQQRqKAIAIgQEQCADQRRqIAQ2AgAgBEEYaiADNgIACwsLCyACQQRqIAhBeHEgAGoiA0EBcjYCACABIANqIAM2AgBB3IUEKAIAIAJGBEBB0IUEIAM2AgAPCwsgA0EDdiEBIANBgAJJBEAgAUEDdEHwhQRqIQBByIUEKAIAIgNBASABdCIBcQR/IABBCGoiASEDIAEoAgAFQciFBCABIANyNgIAIABBCGohAyAACyEBIAMgAjYCACABQQxqIAI2AgAgAkEIaiABNgIAIAJBDGogADYCAA8LIANBCHYiAAR/IANB////B0sEf0EfBSAAIABBgP4/akEQdkEIcSIEdCIBQYDgH2pBEHZBBHEhACABIAB0IgVBgIAPakEQdkECcSEBIANBDiAAIARyIAFyayAFIAF0QQ92aiIAQQdqdkEBcSAAQQF0cgsFQQALIgFBAnRB+IcEaiEAIAJBHGogATYCACACQRRqQQA2AgAgAkEQakEANgIAQcyFBCgCACIEQQEgAXQiBXEEQAJAIAAoAgAiAEEEaigCAEF4cSADRgRAIAAhAQUCQCADQQBBGSABQQF2ayABQR9GG3QhBANAIABBEGogBEEfdkECdGoiBSgCACIBBEAgBEEBdCEEIAFBBGooAgBBeHEgA0YNAiABIQAMAQsLIAUgAjYCACACQRhqIAA2AgAgAkEMaiACNgIAIAJBCGogAjYCAAwCCwsgAUEIaiIAKAIAIgNBDGogAjYCACAAIAI2AgAgAkEIaiADNgIAIAJBDGogATYCACACQRhqQQA2AgALBUHMhQQgBCAFcjYCACAAIAI2AgAgAkEYaiAANgIAIAJBDGogAjYCACACQQhqIAI2AgALQeiFBEHohQQoAgBBf2oiADYCACAABEAPC0GQiQQhAANAIAAoAgAiAUEIaiEAIAENAAtB6IUEQX82AgAL5QEBA38jAiEFIwJBQGskAiAFIQMgACABQQAQZQR/QQEFIAEEfyABQeALEGkiAQR/IAMgATYCACADQQRqQQA2AgAgA0EIaiAANgIAIANBDGpBfzYCACADQRBqIgRCADcCACAEQgA3AgggBEIANwIQIARCADcCGCAEQQA2AiAgBEEAOwEkIARBADoAJiADQTBqQQE2AgAgASgCAEEcaigCACEAIAEgAyACKAIAQQEgAEEHcUExahEBACADQRhqKAIAQQFGBH8gAiAEKAIANgIAQQEFQQALBUEACwVBAAsLIQAgBSQCIAALHQAgACABQQhqKAIAIAUQZQRAIAEgAiADIAQQaAsLsgEAIAAgAUEIaigCACAEEGUEQCABIAIgAxBnBSAAIAEoAgAgBBBlBEACQCABQRBqKAIAIAJHBEAgAUEUaiIAKAIAIAJHBEAgAUEgaiADNgIAIAAgAjYCACABQShqIgAgACgCAEEBajYCACABQSRqKAIAQQFGBEAgAUEYaigCAEECRgRAIAFBNmpBAToAAAsLIAFBLGpBBDYCAAwCCwsgA0EBRgRAIAFBIGpBATYCAAsLCwsLGwAgACABQQhqKAIAQQAQZQRAIAEgAiADEGYLCyAAIAIEfyAAQQRqKAIAIAFBBGooAgAQQEUFIAAgAUYLC20BAn8gAEEQaiIDKAIAIgQEQAJAIAEgBEcEQCAAQSRqIgMgAygCAEEBajYCACAAQQI2AhggAEEBOgA2DAELIABBGGoiAygCAEECRgRAIAMgAjYCAAsLBSADIAE2AgAgACACNgIYIABBATYCJAsLJAAgASAAKAIERgRAIABBHGoiACgCAEEBRwRAIAAgAjYCAAsLC7gBAQF/IABBAToANSACIAAoAgRGBEACQCAAQQE6ADQgAEEQaiIEKAIAIgJFBEAgBCABNgIAIAAgAzYCGCAAQQE2AiQgACgCMEEBRiADQQFGcUUNASAAQQE6ADYMAQsgASACRwRAIABBJGoiBCAEKAIAQQFqNgIAIABBAToANgwBCyAAQRhqIgEoAgAiBEECRgRAIAEgAzYCAAUgBCEDCyAAKAIwQQFGIANBAUZxBEAgAEEBOgA2CwsLC/ACAQl/IwIhBiMCQUBrJAIgACAAKAIAIgJBeGooAgBqIQUgAkF8aigCACEEIAYiAiABNgIAIAIgADYCBCACQfALNgIIIAJBADYCDCACQRRqIQAgAkEYaiEHIAJBHGohCCACQSBqIQkgAkEoaiEKIAJBEGoiA0IANwIAIANCADcCCCADQgA3AhAgA0IANwIYIANBADYCICADQQA7ASQgA0EAOgAmIAQgAUEAEGUEfyACQQE2AjAgBCACIAUgBUEBQQAgBCgCACgCFEEHcUHBAGoRBAAgBUEAIAcoAgBBAUYbBQJ/IAQgAiAFQQFBACAEKAIAKAIYQQdxQTlqEQcAAkACQAJAIAIoAiQOAgACAQsgACgCAEEAIAooAgBBAUYgCCgCAEEBRnEgCSgCAEEBRnEbDAILQQAMAQsgBygCAEEBRwRAQQAgCigCAEUgCCgCAEEBRnEgCSgCAEEBRnFFDQEaCyADKAIACwshACAGJAIgAAtNAQF/IAAgAUEIaigCACAFEGUEQCABIAIgAyAEEGgFIABBCGooAgAiACgCAEEUaigCACEGIAAgASACIAMgBCAFIAZBB3FBwQBqEQQACwvOAgEEfyAAIAFBCGooAgAgBBBlBEAgASACIAMQZwUCQCAAIAEoAgAgBBBlRQRAIABBCGooAgAiACgCAEEYaigCACEFIAAgASACIAMgBCAFQQdxQTlqEQcADAELIAFBEGooAgAgAkcEQCABQRRqIgUoAgAgAkcEQCABQSBqIAM2AgAgAUEsaiIDKAIAQQRHBEAgAUE0aiIGQQA6AAAgAUE1aiIHQQA6AAAgAEEIaigCACIAKAIAQRRqKAIAIQggACABIAIgAkEBIAQgCEEHcUHBAGoRBAAgBywAAARAIAYsAABFIQAgA0EDNgIAIABFDQQFIANBBDYCAAsLIAUgAjYCACABQShqIgAgACgCAEEBajYCACABQSRqKAIAQQFHDQIgAUEYaigCAEECRw0CIAFBNmpBAToAAAwCCwsgA0EBRgRAIAFBIGpBATYCAAsLCwtGAQF/IAAgAUEIaigCAEEAEGUEQCABIAIgAxBmBSAAQQhqKAIAIgAoAgBBHGooAgAhBCAAIAEgAiADIARBB3FBMWoRAQALCwoAIAAgAUEAEGULwwQBBX8jAiEHIwJBQGskAiAHIQMgAUHwDEEAEGUEfyACQQA2AgBBAQUCfyAAIAEQbwRAQQEgAigCACIARQ0BGiACIAAoAgA2AgBBAQwBCyABBH8gAUGoDBBpIgEEfyACKAIAIgQEQCACIAQoAgA2AgALIAFBCGooAgAiBUEHcSAAQQhqIgQoAgAiBkEHc3EEf0EABSAGIAVB4ABxQeAAc3EEf0EABSAAQQxqIgUoAgAiACABQQxqIgEoAgAiBkEAEGUEf0EBBSAAQegMQQAQZQRAQQEgBkUNBhogBkG4DBBpRQwGCyAABH8gAEGoDBBpIgAEQEEAIAQoAgBBAXFFDQcaIAAgASgCABBwDAcLIAUoAgAiAAR/IABByAwQaSIABEBBACAEKAIAQQFxRQ0IGiAAIAEoAgAQcQwICyAFKAIAIgAEfyAAQeALEGkiAAR/IAEoAgAiAQR/IAFB4AsQaSIBBH8gAyABNgIAIANBBGpBADYCACADQQhqIAA2AgAgA0EMakF/NgIAIANBEGoiAEIANwIAIABCADcCCCAAQgA3AhAgAEIANwIYIABBADYCICAAQQA7ASQgAEEAOgAmIANBMGpBATYCACABKAIAQRxqKAIAIQQgASADIAIoAgBBASAEQQdxQTFqEQEAIANBGGooAgBBAUYEfwJ/QQEgAigCAEUNABogAiAAKAIANgIAQQELBUEACwVBAAsFQQALBUEACwVBAAsFQQALBUEACwsLCwVBAAsFQQALCwshACAHJAIgAAtMAQF/An8CQCAAKAIIQRhxBH9BASECDAEFIAEEfyABQZgMEGkiAgR/IAIoAghBGHFBAEchAgwDBUEACwVBAAsLDAELIAAgASACEGULC8QBAQJ/AkACQANAAkAgAUUEQEEAIQAMAQsgAUGoDBBpIgFFBEBBACEADAELIAFBCGooAgAgAEEIaigCACICQX9zcQRAQQAhAAwBCyAAQQxqIgMoAgAiACABQQxqIgEoAgBBABBlBEBBASEADAELIABFIAJBAXFFcgRAQQAhAAwBCyAAQagMEGkiAEUNAiABKAIAIQEMAQsLDAELIAMoAgAiAAR/IABByAwQaSIABH8gACABKAIAEHEFQQALBUEACyEACyAAC2EAIAEEfyABQcgMEGkiAQR/IAFBCGooAgAgAEEIaigCAEF/c3EEf0EABSAAQQxqKAIAIAFBDGooAgBBABBlBH8gAEEQaigCACABQRBqKAIAQQAQZQVBAAsLBUEACwVBAAsLhwMBC38gACABQQhqKAIAIAUQZQRAIAEgAiADIAQQaAUgAUE0aiIILAAAIQcgAUE1aiIJLAAAIQYgAEEQaiAAQQxqKAIAIgpBA3RqIQ4gCEEAOgAAIAlBADoAACAAQRBqIAEgAiADIAQgBRB2IAcgCCwAACILciEHIAYgCSwAACIMciEGIApBAUoEQAJAIAFBGGohDyAAQQhqIQ0gAUE2aiEQIABBGGohCgN/IAZBAXEhBiAHQQFxIQAgECwAAARAIAYhAQwCCyALQf8BcQRAIA8oAgBBAUYEQCAGIQEMAwsgDSgCAEECcUUEQCAGIQEMAwsFIAxB/wFxBEAgDSgCAEEBcUUEQCAGIQEMBAsLCyAIQQA6AAAgCUEAOgAAIAogASACIAMgBCAFEHYgCCwAACILIAByIQcgCSwAACIMIAZyIQAgCkEIaiIKIA5JBH8gACEGDAEFIAAhASAHCwshAAsFIAYhASAHIQALIAggAEH/AXFBAEc6AAAgCSABQf8BcUEARzoAAAsLrAUBCX8gACABQQhqKAIAIAQQZQRAIAEgAiADEGcFAkAgACABKAIAIAQQZUUEQCAAQQxqKAIAIQUgAEEQaiABIAIgAyAEEHcgBUEBTA0BIABBEGogBUEDdGohByAAQRhqIQUgAEEIaigCACIGQQJxRQRAIAFBJGoiACgCAEEBRwRAIAZBAXFFBEAgAUE2aiEGA0AgBiwAAA0FIAAoAgBBAUYNBSAFIAEgAiADIAQQdyAFQQhqIgUgB0kNAAsMBAsgAUEYaiEGIAFBNmohCANAIAgsAAANBCAAKAIAQQFGBEAgBigCAEEBRg0FCyAFIAEgAiADIAQQdyAFQQhqIgUgB0kNAAsMAwsLIAFBNmohAANAIAAsAAANAiAFIAEgAiADIAQQdyAFQQhqIgUgB0kNAAsMAQsgAUEQaigCACACRwRAIAFBFGoiCSgCACACRwRAIAFBIGogAzYCACABQSxqIgooAgBBBEcEQCAAQRBqIABBDGooAgBBA3RqIQsgAUE0aiEHIAFBNWohBiABQTZqIQwgAEEIaiEIIAFBGGohDUEAIQMgAEEQaiEAIAoCfwJAA0ACQCAAIAtPDQAgB0EAOgAAIAZBADoAACAAIAEgAiACQQEgBBB2IAwsAAANACAGLAAABEACQCAHLAAARQRAIAgoAgBBAXEEQEEBIQUMAgUMBgsACyANKAIAQQFGBEBBASEDDAULIAgoAgBBAnEEf0EBIQVBAQVBASEDDAULIQMLCyAAQQhqIQAMAQsLIAUEfwwBBUEECwwBC0EDCzYCACADQQFxDQMLIAkgAjYCACABQShqIgAgACgCAEEBajYCACABQSRqKAIAQQFHDQIgAUEYaigCAEECRw0CIAFBNmpBAToAAAwCCwsgA0EBRgRAIAFBIGpBATYCAAsLCwt5AQJ/IAAgAUEIaigCAEEAEGUEQCABIAIgAxBmBQJAIABBEGogAEEMaigCACIEQQN0aiEFIABBEGogASACIAMQdSAEQQFKBEAgAUE2aiEEIABBGGohAANAIAAgASACIAMQdSAELAAADQIgAEEIaiIAIAVJDQALCwsLC18BA38gAEEEaigCACEFIAIEQCAFQQh1IQQgBUEBcQRAIAIoAgAgBGooAgAhBAsLIAAoAgAiACgCAEEcaigCACEGIAAgASACIARqIANBAiAFQQJxGyAGQQdxQTFqEQEAC10BA38gAEEEaigCACIHQQh1IQYgB0EBcQRAIAMoAgAgBmooAgAhBgsgACgCACIAKAIAQRRqKAIAIQggACABIAIgAyAGaiAEQQIgB0ECcRsgBSAIQQdxQcEAahEEAAtaAQN/IABBBGooAgAiBkEIdSEFIAZBAXEEQCACKAIAIAVqKAIAIQULIAAoAgAiACgCAEEYaigCACEHIAAgASACIAVqIANBAiAGQQJxGyAEIAdBB3FBOWoRBwALxgMBA38gAkGAwABOBEAgACABIAIQFhogAA8LIAAhBCAAIAJqIQMgAEEDcSABQQNxRgRAA0AgAEEDcQRAIAJFBEAgBA8LIAAgASwAADoAACAAQQFqIQAgAUEBaiEBIAJBAWshAgwBCwsgA0F8cSICQUBqIQUDQCAAIAVMBEAgACABKAIANgIAIAAgASgCBDYCBCAAIAEoAgg2AgggACABKAIMNgIMIAAgASgCEDYCECAAIAEoAhQ2AhQgACABKAIYNgIYIAAgASgCHDYCHCAAIAEoAiA2AiAgACABKAIkNgIkIAAgASgCKDYCKCAAIAEoAiw2AiwgACABKAIwNgIwIAAgASgCNDYCNCAAIAEoAjg2AjggACABKAI8NgI8IABBQGshACABQUBrIQEMAQsLA0AgACACSARAIAAgASgCADYCACAAQQRqIQAgAUEEaiEBDAELCwUgA0EEayECA0AgACACSARAIAAgASwAADoAACAAIAEsAAE6AAEgACABLAACOgACIAAgASwAAzoAAyAAQQRqIQAgAUEEaiEBDAELCwsDQCAAIANIBEAgACABLAAAOgAAIABBAWohACABQQFqIQEMAQsLIAQLmAIBBH8gACACaiEEIAFB/wFxIQEgAkHDAE4EQANAIABBA3EEQCAAIAE6AAAgAEEBaiEADAELCyABQQh0IAFyIAFBEHRyIAFBGHRyIQMgBEF8cSIFQUBqIQYDQCAAIAZMBEAgACADNgIAIAAgAzYCBCAAIAM2AgggACADNgIMIAAgAzYCECAAIAM2AhQgACADNgIYIAAgAzYCHCAAIAM2AiAgACADNgIkIAAgAzYCKCAAIAM2AiwgACADNgIwIAAgAzYCNCAAIAM2AjggACADNgI8IABBQGshAAwBCwsDQCAAIAVIBEAgACADNgIAIABBBGohAAwBCwsLA0AgACAESARAIAAgAToAACAAQQFqIQAMAQsLIAQgAmsLUgEDfxAVIQMgACMBKAIAIgJqIgEgAkggAEEASnEgAUEASHIEQCABEBgaQQwQAUF/DwsgASADSgRAIAEQF0UEQEEMEAFBfw8LCyMBIAE2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P0bsfz8AAIA/AAAAAOAFAAAEAAAABQAAAAYAAAAHAAAAAQAAAAIAAAABAAAAAwAAAAAAAAAIBgAABAAAAAgAAAAGAAAABwAAAAEAAAADAAAAAgAAAAQAAAAAAAAAWAYAAAQAAAAJAAAABgAAAAcAAAACAAAAAAAAACgGAAAEAAAACgAAAAYAAAAHAAAAAwAAAAAAAADYBgAABAAAAAsAAAAGAAAABwAAAAEAAAAEAAAAAwAAAAUAAABONEtPUkcxNExvZ3VlUHJvY2Vzc29yRQBONEtPUkcxNUxvZ3VlT3NjaWxsYXRvckUAaWkATG9ndWVQcm9jZXNzb3IAdmkATG9ndWVPc2NpbGxhdG9yAExvZ3VlRWZmZWN0AFBLTjRLT1JHMTFMb2d1ZUVmZmVjdEUAUE40S09SRzExTG9ndWVFZmZlY3RFAE40S09SRzExTG9ndWVFZmZlY3RFAFBLTjRLT1JHMTVMb2d1ZU9zY2lsbGF0b3JFAFBONEtPUkcxNUxvZ3VlT3NjaWxsYXRvckUAUEtONEtPUkcxNExvZ3VlUHJvY2Vzc29yRQBQTjRLT1JHMTRMb2d1ZVByb2Nlc3NvckUAc2V0AE5TdDNfXzIxMmJhc2ljX3N0cmluZ0ljTlNfMTFjaGFyX3RyYWl0c0ljRUVOU185YWxsb2NhdG9ySWNFRUVFAE5TdDNfXzIyMV9fYmFzaWNfc3RyaW5nX2NvbW1vbklMYjFFRUUATjNXQUI5UHJvY2Vzc29yRQB2AFByb2Nlc3NvcgBpbml0AGlpaWlpaQBzZXRQYXJhbQB2aWlpZABwcm9jZXNzAHZpaWlpaQBvbm1lc3NhZ2UAaWlpaWlpaQBnZXRJbnN0YW5jZQBpaWkATjEwZW1zY3JpcHRlbjN2YWxFAFBLTjNXQUI5UHJvY2Vzc29yRQBQTjNXQUI5UHJvY2Vzc29yRQBsZW5ndGgAdm9pZABib29sAGNoYXIAc2lnbmVkIGNoYXIAdW5zaWduZWQgY2hhcgBzaG9ydAB1bnNpZ25lZCBzaG9ydABpbnQAdW5zaWduZWQgaW50AGxvbmcAdW5zaWduZWQgbG9uZwBmbG9hdABkb3VibGUAc3RkOjpzdHJpbmcAc3RkOjpiYXNpY19zdHJpbmc8dW5zaWduZWQgY2hhcj4Ac3RkOjp3c3RyaW5nAGVtc2NyaXB0ZW46OnZhbABlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxzaWduZWQgY2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgY2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8c2hvcnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIHNob3J0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGludD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8bG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgbG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50OF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50OF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQxNl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50MTZfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50MzJfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDMyX3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGZsb2F0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxkb3VibGU+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGxvbmcgZG91YmxlPgBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0llRUUATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJZEVFAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWZFRQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0ltRUUATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJbEVFAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWpFRQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lpRUUATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJdEVFAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SXNFRQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0loRUUATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJYUVFAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWNFRQBOU3QzX18yMTJiYXNpY19zdHJpbmdJd05TXzExY2hhcl90cmFpdHNJd0VFTlNfOWFsbG9jYXRvckl3RUVFRQBOU3QzX18yMTJiYXNpY19zdHJpbmdJaE5TXzExY2hhcl90cmFpdHNJaEVFTlNfOWFsbG9jYXRvckloRUVFRQBOMTBfX2N4eGFiaXYxMTZfX3NoaW1fdHlwZV9pbmZvRQBTdDl0eXBlX2luZm8ATjEwX19jeHhhYml2MTIwX19zaV9jbGFzc190eXBlX2luZm9FAE4xMF9fY3h4YWJpdjExN19fY2xhc3NfdHlwZV9pbmZvRQBOMTBfX2N4eGFiaXYxMTdfX3BiYXNlX3R5cGVfaW5mb0UATjEwX19jeHhhYml2MTE5X19wb2ludGVyX3R5cGVfaW5mb0UATjEwX19jeHhhYml2MTIwX19mdW5jdGlvbl90eXBlX2luZm9FAE4xMF9fY3h4YWJpdjEyOV9fcG9pbnRlcl90b19tZW1iZXJfdHlwZV9pbmZvRQBOMTBfX2N4eGFiaXYxMjNfX2Z1bmRhbWVudGFsX3R5cGVfaW5mb0UAdgBEbgBiAGMAaABhAHMAdABpAGoAbABtAGYAZABOMTBfX2N4eGFiaXYxMjFfX3ZtaV9jbGFzc190eXBlX2luZm9F";
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
    env["table"]=wasmTable=new WebAssembly.Table({"initial":73,"maximum":73,"element":"anyfunc"});
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
var tempDoublePtr=67968;
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
