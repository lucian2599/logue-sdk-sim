var Module=typeof WABModule!=="undefined"?WABModule: {};
WABModule.manifest= {"header":{"platform":"prologue","module":"osc","api":"1.0-0","dev_id":0,"prg_id":0,"version":"1.3-0","name":"mo2add","num_param":3,"params":[["Bumps",0,100,"%"],["Hammond",0,100,"%"],["LFO Target",0,3,""]]}};
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
var STACK_BASE=26384,DYNAMIC_BASE=5269264,DYNAMICTOP_PTR=26352;
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
var wasmBinaryFile="data:application/octet-stream;base64,AGFzbQEAAAABvgEaYAF/AGAEf39/fwBgBH9/f38Bf2ADf398AGAGf39/f39/AGABfwF/YAAAYAV/f39/fwBgAn9/AX9gA39/fwF/YAV/f39/fwF/YAZ/f39/f38Bf2ACf38AYAR/f398AGANf39/f39/f39/f39/fwBgCH9/f39/f39/AGADf39/AGADf39/AXxgAAF/YAV/fX9/fwBgAX0BfWAAAX1gAX0Bf2AHf39/f39/fwF/YAV/f39/fABgB39/f39/f38AAvsFHQNlbnYFYWJvcnQAAANlbnYLX19fc2V0RXJyTm8AAANlbnYWX19lbWJpbmRfcmVnaXN0ZXJfYm9vbAAHA2VudhdfX2VtYmluZF9yZWdpc3Rlcl9jbGFzcwAOA2VudiBfX2VtYmluZF9yZWdpc3Rlcl9jbGFzc19mdW5jdGlvbgAPA2VudhdfX2VtYmluZF9yZWdpc3Rlcl9lbXZhbAAMA2VudhdfX2VtYmluZF9yZWdpc3Rlcl9mbG9hdAAQA2VudhpfX2VtYmluZF9yZWdpc3Rlcl9mdW5jdGlvbgAEA2VudhlfX2VtYmluZF9yZWdpc3Rlcl9pbnRlZ2VyAAcDZW52HV9fZW1iaW5kX3JlZ2lzdGVyX21lbW9yeV92aWV3ABADZW52HF9fZW1iaW5kX3JlZ2lzdGVyX3N0ZF9zdHJpbmcADANlbnYdX19lbWJpbmRfcmVnaXN0ZXJfc3RkX3dzdHJpbmcAEANlbnYWX19lbWJpbmRfcmVnaXN0ZXJfdm9pZAAMA2VudgpfX2VtdmFsX2FzABEDZW52Dl9fZW12YWxfZGVjcmVmAAADZW52FF9fZW12YWxfZ2V0X3Byb3BlcnR5AAgDZW52Dl9fZW12YWxfaW5jcmVmAAADZW52E19fZW12YWxfbmV3X2NzdHJpbmcABQNlbnYXX19lbXZhbF9ydW5fZGVzdHJ1Y3RvcnMAAANlbnYSX19lbXZhbF90YWtlX3ZhbHVlAAgDZW52Bl9hYm9ydAAGA2VudhlfZW1zY3JpcHRlbl9nZXRfaGVhcF9zaXplABIDZW52Fl9lbXNjcmlwdGVuX21lbWNweV9iaWcACQNlbnYXX2Vtc2NyaXB0ZW5fcmVzaXplX2hlYXAABQNlbnYXYWJvcnRPbkNhbm5vdEdyb3dNZW1vcnkABQNlbnYMX190YWJsZV9iYXNlA38AA2Vudg5EWU5BTUlDVE9QX1BUUgN/AANlbnYGbWVtb3J5AgCAAgNlbnYFdGFibGUBcAFbWwODAYEBBQYFEgAMAAEAAgMBBgUFAAUEBgoNBwsIBQUQDAAADAwEExMUFBQSEhUGEggIBRYGBgYGBgYGBgYGBgYGAAAAAAAABgYGBgYFBQgFAAkEBwEJEBABCAQHAQkJCAgIBAcBAQQHCQkFCQIKCxcADBANGAcEGQUICQIKCwYADAMNAQcEBhACfwFBkM4BC38BQZDOwQILB5IFKRBfX2dyb3dXYXNtTWVtb3J5ABkSX19aMTJjcmVhdGVNb2R1bGVpACkrX19fZW1iaW5kX3JlZ2lzdGVyX25hdGl2ZV9hbmRfYnVpbHRpbl90eXBlcwBIEV9fX2Vycm5vX2xvY2F0aW9uAEMOX19fZ2V0VHlwZU5hbWUAYAxfX2hvb2tfY3ljbGUAMwtfX2hvb2tfaW5pdAA0Cl9faG9va19vZmYANQlfX2hvb2tfb24ANgxfX2hvb2tfcGFyYW0ANxBfX29zY19ibF9wYXJfaWR4ADwQX19vc2NfYmxfc2F3X2lkeAA9EF9fb3NjX2JsX3Nxcl9pZHgAPg5fX29zY19tY3VfaGFzaAA/Cl9fb3NjX3JhbmQAQAtfX29zY193aGl0ZQBBBV9mcmVlAGQHX21hbGxvYwBjB19tZW1jcHkAfAdfbWVtc2V0AH0NX29zY19hcGlfaW5pdABCBV9zYnJrAH4KZHluQ2FsbF9paQAwC2R5bkNhbGxfaWlpAH8MZHluQ2FsbF9paWlpAIABDWR5bkNhbGxfaWlpaWkAgQEOZHluQ2FsbF9paWlpaWkAggEPZHluQ2FsbF9paWlpaWlpAIMBCWR5bkNhbGxfdgCEAQpkeW5DYWxsX3ZpAIUBC2R5bkNhbGxfdmlpAIYBDGR5bkNhbGxfdmlpZACHAQ1keW5DYWxsX3ZpaWlkAIgBDWR5bkNhbGxfdmlpaWkAiQEOZHluQ2FsbF92aWlpaWkAigEPZHluQ2FsbF92aWlpaWlpAIsBE2VzdGFibGlzaFN0YWNrU3BhY2UAHgtnbG9iYWxDdG9ycwAaCnN0YWNrQWxsb2MAGwxzdGFja1Jlc3RvcmUAHQlzdGFja1NhdmUAHAmJAQEAIwALW4wBJicnJicnJicn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BQVBACECCwwCC0EAEH4iAUF/RgR/QQAFQejDASgCACIFIAFBlMQBKAIAIgJBf2oiA2pBACACa3EgAWtBACABIANxGyAEaiICaiEDIAJB/////wdJIAIgAEtxBH9B8MMBKAIAIggEQCADIAVNIAMgCEtyBEBBACECDAULCyABIAIQfiIDRg0FIAMhAQwCBUEACwshAgwBCyABQX9HIAJB/////wdJcSAHIAJLcUUEQCABQX9GBEBBACECDAIFDAQLAAtBmMQBKAIAIgMgBiACa2pBACADa3EiA0H/////B08NAkEAIAJrIQYgAxB+QX9GBH8gBhB+GkEABSACIANqIQIMAwshAgtB9MMBQfTDASgCAEEEcjYCAAsgBEH/////B0kEQCAEEH4hAUEAEH4iAyABayIGIABBKGpLIQQgBiACIAQbIQIgBEEBcyABQX9GciABQX9HIANBf0dxIAEgA0lxQQFzckUNAQsMAQtB6MMBQejDASgCACACaiIDNgIAIANB7MMBKAIASwRAQezDASADNgIAC0HQwAEoAgAiBARAAkBB+MMBIQMCQAJAA0AgAygCACIGIAMoAgQiBWogAUYNASADKAIIIgMNAAsMAQsgA0EEaiEIIAMoAgxBCHFFBEAgBiAETSABIARLcQRAIAggAiAFajYCACAEQQAgBEEIaiIBa0EHcUEAIAFBB3EbIgNqIQFBxMABKAIAIAJqIgYgA2shAkHQwAEgATYCAEHEwAEgAjYCACABIAJBAXI2AgQgBCAGakEoNgIEQdTAAUGgxAEoAgA2AgAMAwsLCyABQcjAASgCAEkEQEHIwAEgATYCAAsgASACaiEGQfjDASEDAkACQANAIAMoAgAgBkYNASADKAIIIgMNAAsMAQsgAygCDEEIcUUEQCADIAE2AgAgA0EEaiIDIAMoAgAgAmo2AgBBACABQQhqIgJrQQdxQQAgAkEHcRsgAWoiByAAaiEFIAZBACAGQQhqIgFrQQdxQQAgAUEHcRtqIgIgB2sgAGshAyAHIABBA3I2AgQgAiAERgRAQcTAAUHEwAEoAgAgA2oiADYCAEHQwAEgBTYCACAFIABBAXI2AgQFAkBBzMABKAIAIAJGBEBBwMABQcDAASgCACADaiIANgIAQczAASAFNgIAIAUgAEEBcjYCBCAAIAVqIAA2AgAMAQsgAigCBCIJ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IAAoAgAiAEEEaigCAEF4cSADRgRAIAAhAQUCQCADQQBBGSABQQF2ayABQR9GG3QhBANAIABBEGogBEEfdkECdGoiBSgCACIBBEAgBEEBdCEEIAFBBGooAgBBeHEgA0YNAiABIQAMAQsLIAUgAjYCACACQRhqIAA2AgAgAkEMaiACNgIAIAJBCGogAjYCAAwCCwsgAUEIaiIAKAIAIgNBDGogAjYCACAAIAI2AgAgAkEIaiADNgIAIAJBDGogATYCACACQRhqQQA2AgALBUG8wAEgBCAFcjYCACAAIAI2AgAgAkEYaiAANgIAIAJBDGogAjYCACACQQhqIAI2AgALQdjAAUHYwAEoAgBBf2oiADYCACAABEAPC0GAxAEhAANAIAAoAgAiAUEIaiEAIAENAAtB2MABQX82AgAL5wEBA38jAiEFIwJBQGskAiAFIQMgACABQQAQaQR/QQEFIAEEfyABQajFABBtIgEEfyADIAE2AgAgA0EEakEANgIAIANBCGogADYCACADQQxqQX82AgAgA0EQaiIEQgA3AgAgBEIANwIIIARCADcCECAEQgA3AhggBEEANgIgIARBADsBJCAEQQA6ACYgA0EwakEBNgIAIAEoAgBBHGooAgAhACABIAMgAigCAEEBIABBB3FBwwBqEQEAIANBGGooAgBBAUYEfyACIAQoAgA2AgBBAQVBAAsFQQALBUEACwshACAFJAIgAAsdACAAIAFBCGooAgAgBRBpBEAgASACIAMgBBBsCwuyAQAgACABQQhqKAIAIAQQaQRAIAEgAiADEGsFIAAgASgCACAEEGkEQAJAIAFBEGooAgAgAkcEQCABQRRqIgAoAgAgAkcEQCABQSBqIAM2AgAgACACNgIAIAFBKGoiACAAKAIAQQFqNgIAIAFBJGooAgBBAUYEQCABQRhqKAIAQQJGBEAgAUE2akEBOgAACwsgAUEsakEENgIADAILCyADQQFGBEAgAUEgakEBNgIACwsLCwsbACAAIAFBCGooAgBBABBpBEAgASACIAMQagsLIAAgAgR/IABBBGooAgAgAUEEaigCABBERQUgACABRgsLbQECfyAAQRBqIgMoAgAiBARAAkAgASAERwRAIABBJGoiAyADKAIAQQFqNgIAIABBAjYCGCAAQQE6ADYMAQsgAEEYaiIDKAIAQQJGBEAgAyAC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P0rrKz/ChTA/9wQ1P0BoOT/3rj0/c9hBP/zjRT8L0Uk/Cp9NP0BNUT8421Q/WkhYPyGUWz8Gvl4/k8VhP1SqZD/Ta2c/qwlqP2aDbD+h2G4/BwlxP0QUcz8F+nQ/Brp2P/RTeD+bx3k/uhR7Py47fD+0On0/KxN+P3LEfj9mTn8/B7F/P0bsfz8AAIA/AAAAAKgiAAAFAAAABgAAAAcAAAAIAAAAAQAAAAMAAAABAAAAAwAAAAAAAADQIgAABQAAAAkAAAAHAAAACAAAAAEAAAAEAAAAAgAAAAQAAAAAAAAAICMAAAUAAAAKAAAABwAAAAgAAAACAAAAAAAAAPAiAAAFAAAACwAAAAcAAAAIAAAAAwAAAAAAAACgIwAABQAAAAwAAAAHAAAACAAAAAEAAAAFAAAAAwAAAAUAAABONEtPUkcxNExvZ3VlUHJvY2Vzc29yRQBONEtPUkcxNUxvZ3VlT3NjaWxsYXRvckUAaWkATG9ndWVQcm9jZXNzb3IAdmkATG9ndWVPc2NpbGxhdG9yAExvZ3VlRWZmZWN0AFBLTjRLT1JHMTFMb2d1ZUVmZmVjdEUAUE40S09SRzExTG9ndWVFZmZlY3RFAE40S09SRzExTG9ndWVFZmZlY3RFAFBLTjRLT1JHMTVMb2d1ZU9zY2lsbGF0b3JFAFBONEtPUkcxNUxvZ3VlT3NjaWxsYXRvckUAUEtONEtPUkcxNExvZ3VlUHJvY2Vzc29yRQBQTjRLT1JHMTRMb2d1ZVByb2Nlc3NvckUAc2V0AE5TdDNfXzIxMmJhc2ljX3N0cmluZ0ljTlNfMTFjaGFyX3RyYWl0c0ljRUVOU185YWxsb2NhdG9ySWNFRUVFAE5TdDNfXzIyMV9fYmFzaWNfc3RyaW5nX2NvbW1vbklMYjFFRUUATjNXQUI5UHJvY2Vzc29yRQB2AFByb2Nlc3NvcgBpbml0AGlpaWlpaQBzZXRQYXJhbQB2aWlpZABwcm9jZXNzAHZpaWlpaQBvbm1lc3NhZ2UAaWlpaWlpaQBnZXRJbnN0YW5jZQBpaWkATjEwZW1zY3JpcHRlbjN2YWxFAFBLTjNXQUI5UHJvY2Vzc29yRQBQTjNXQUI5UHJvY2Vzc29yRQBsZW5ndGgATjZwbGFpdHMxNEFkZGl0aXZlRW5naW5lRQBONnBsYWl0czZFbmdpbmVFAHZvaWQAYm9vbABjaGFyAHNpZ25lZCBjaGFyAHVuc2lnbmVkIGNoYXIAc2hvcnQAdW5zaWduZWQgc2hvcnQAaW50AHVuc2lnbmVkIGludABsb25nAHVuc2lnbmVkIGxvbmcAZmxvYXQAZG91YmxlAHN0ZDo6c3RyaW5nAHN0ZDo6YmFzaWNfc3RyaW5nPHVuc2lnbmVkIGNoYXI+AHN0ZDo6d3N0cmluZwBlbXNjcmlwdGVuOjp2YWwAZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8Y2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8c2lnbmVkIGNoYXI+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGNoYXI+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHNob3J0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBzaG9ydD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBpbnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGxvbmc+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGxvbmc+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDhfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDhfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50MTZfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDE2X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDMyX3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxmbG9hdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8ZG91YmxlPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxsb25nIGRvdWJsZT4ATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJZUVFAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWRFRQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lmRUUATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJbUVFAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWxFRQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lqRUUATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJaUVFAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SXRFRQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lzRUUATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJaEVFAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWFFRQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0ljRUUATlN0M19fMjEyYmFzaWNfc3RyaW5nSXdOU18xMWNoYXJfdHJhaXRzSXdFRU5TXzlhbGxvY2F0b3JJd0VFRUUATlN0M19fMjEyYmFzaWNfc3RyaW5nSWhOU18xMWNoYXJfdHJhaXRzSWhFRU5TXzlhbGxvY2F0b3JJaEVFRUUATjEwX19jeHhhYml2MTE2X19zaGltX3R5cGVfaW5mb0UAU3Q5dHlwZV9pbmZvAE4xMF9fY3h4YWJpdjEyMF9fc2lfY2xhc3NfdHlwZV9pbmZvRQBOMTBfX2N4eGFiaXYxMTdfX2NsYXNzX3R5cGVfaW5mb0UATjEwX19jeHhhYml2MTE3X19wYmFzZV90eXBlX2luZm9FAE4xMF9fY3h4YWJpdjExOV9fcG9pbnRlcl90eXBlX2luZm9FAE4xMF9fY3h4YWJpdjEyMF9fZnVuY3Rpb25fdHlwZV9pbmZvRQBOMTBfX2N4eGFiaXYxMjlfX3BvaW50ZXJfdG9fbWVtYmVyX3R5cGVfaW5mb0UATjEwX19jeHhhYml2MTIzX19mdW5kYW1lbnRhbF90eXBlX2luZm9FAHYARG4AYgBjAGgAYQBzAHQAaQBqAGwAbQBmAGQATjEwX19jeHhhYml2MTIxX192bWlfY2xhc3NfdHlwZV9pbmZvRQ==";
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
var tempDoublePtr=26368;
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
