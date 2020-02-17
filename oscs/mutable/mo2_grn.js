var Module=typeof WABModule!=="undefined"?WABModule: {};
WABModule.manifest= {"header":{"platform":"prologue","module":"osc","api":"1.0-0","dev_id":0,"prg_id":0,"version":"1.3-0","name":"mo2grn","num_param":3,"params":[["Width",0,100,"%"],["Filter",0,100,"%"],["LFO Target",0,3,""]]}};
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
var STACK_BASE=26048,DYNAMIC_BASE=5268928,DYNAMICTOP_PTR=26016;
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
var wasmBinaryFile="data:application/octet-stream;base64,AGFzbQEAAAAB0QEcYAF/AGAEf39/fwBgBH9/f38Bf2ADf398AGAGf39/f39/AGABfwF/YAAAYAV/f39/fwBgAn9/AX9gA39/fwF/YAV/f39/fwF/YAZ/f39/f38Bf2ACf38AYAR/f398AGANf39/f39/f39/f39/fwBgCH9/f39/f39/AGADf39/AGADf39/AXxgAAF/YAd/fX19fX9/AGAFfX19fX0BfWAEfX19fQF9YAF9AX1gAAF9YAF9AX9gB39/f39/f38Bf2AFf39/f3wAYAd/f39/f39/AAL7BR0DZW52BWFib3J0AAADZW52C19fX3NldEVyck5vAAADZW52Fl9fZW1iaW5kX3JlZ2lzdGVyX2Jvb2wABwNlbnYXX19lbWJpbmRfcmVnaXN0ZXJfY2xhc3MADgNlbnYgX19lbWJpbmRfcmVnaXN0ZXJfY2xhc3NfZnVuY3Rpb24ADwNlbnYXX19lbWJpbmRfcmVnaXN0ZXJfZW12YWwADANlbnYXX19lbWJpbmRfcmVnaXN0ZXJfZmxvYXQAEANlbnYaX19lbWJpbmRfcmVnaXN0ZXJfZnVuY3Rpb24ABANlbnYZX19lbWJpbmRfcmVnaXN0ZXJfaW50ZWdlcgAHA2Vudh1fX2VtYmluZF9yZWdpc3Rlcl9tZW1vcnlfdmlldwAQA2VudhxfX2VtYmluZF9yZWdpc3Rlcl9zdGRfc3RyaW5nAAwDZW52HV9fZW1iaW5kX3JlZ2lzdGVyX3N0ZF93c3RyaW5nABADZW52Fl9fZW1iaW5kX3JlZ2lzdGVyX3ZvaWQADANlbnYKX19lbXZhbF9hcwARA2Vudg5fX2VtdmFsX2RlY3JlZgAAA2VudhRfX2VtdmFsX2dldF9wcm9wZXJ0eQAIA2Vudg5fX2VtdmFsX2luY3JlZgAAA2VudhNfX2VtdmFsX25ld19jc3RyaW5nAAUDZW52F19fZW12YWxfcnVuX2Rlc3RydWN0b3JzAAADZW52El9fZW12YWxfdGFrZV92YWx1ZQAIA2VudgZfYWJvcnQABgNlbnYZX2Vtc2NyaXB0ZW5fZ2V0X2hlYXBfc2l6ZQASA2VudhZfZW1zY3JpcHRlbl9tZW1jcHlfYmlnAAkDZW52F19lbXNjcmlwdGVuX3Jlc2l6ZV9oZWFwAAUDZW52F2Fib3J0T25DYW5ub3RHcm93TWVtb3J5AAUDZW52DF9fdGFibGVfYmFzZQN/AANlbnYORFlOQU1JQ1RPUF9QVFIDfwADZW52Bm1lbW9yeQIAgAIDZW52BXRhYmxlAXABW1sDhQGDAQUGBRIADAABAAIDAQYFBQAFBAYKDQcLCAUFEAwAAAwMBBMTFBUWFhYSEhcGEggIBRgGBgYGBgYGBgYGBgYGAAAAAAAABgYGBgYFBQgFAAkEBwEJEBABCAQHAQkJCAgIBAcBAQQHCQkFCQIKCxkADBANGgcEGwUICQIKCwYADAMNAQcEBhACfwFBwMsBC38BQcDLwQILB5QFKRBfX2dyb3dXYXNtTWVtb3J5ABkSX19aMTJjcmVhdGVNb2R1bGVpACkrX19fZW1iaW5kX3JlZ2lzdGVyX25hdGl2ZV9hbmRfYnVpbHRpbl90eXBlcwBKEV9fX2Vycm5vX2xvY2F0aW9uAEUOX19fZ2V0VHlwZU5hbWUAYgxfX2hvb2tfY3ljbGUAMwtfX2hvb2tfaW5pdAA0Cl9faG9va19vZmYANQlfX2hvb2tfb24ANgxfX2hvb2tfcGFyYW0ANxBfX29zY19ibF9wYXJfaWR4AD4QX19vc2NfYmxfc2F3X2lkeAA/EF9fb3NjX2JsX3Nxcl9pZHgAQA5fX29zY19tY3VfaGFzaABBCl9fb3NjX3JhbmQAQgtfX29zY193aGl0ZQBDBV9mcmVlAGYHX21hbGxvYwBlB19tZW1jcHkAfgdfbWVtc2V0AH8NX29zY19hcGlfaW5pdABEBV9zYnJrAIABCmR5bkNhbGxfaWkAMAtkeW5DYWxsX2lpaQCBAQxkeW5DYWxsX2lpaWkAggENZHluQ2FsbF9paWlpaQCDAQ5keW5DYWxsX2lpaWlpaQCEAQ9keW5DYWxsX2lpaWlpaWkAhQEJZHluQ2FsbF92AIYBCmR5bkNhbGxfdmkAhwELZHluQ2FsbF92aWkAiAEMZHluQ2FsbF92aWlkAIkBDWR5bkNhbGxfdmlpaWQAigENZHluQ2FsbF92aWlpaQCLAQ5keW5DYWxsX3ZpaWlpaQCMAQ9keW5DYWxsX3ZpaWlpaWkAjQETZXN0YWJsaXNoU3RhY2tTcGFjZQAeC2dsb2JhbEN0b3JzABoKc3RhY2tBbGxvYwAbDHN0YWNrUmVzdG9yZQAdCXN0YWNrU2F2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ADoAACAAIAEsAAE6AAEgACABLAACOgACIAAgASwAAzoAAyAAQQRqIQAgAUEEaiEBDAELCwsDQCAAIANIBEAgACABLAAAOgAAIABBAWohACABQQFqIQEMAQsLIAQLmAIBBH8gACACaiEEIAFB/wFxIQEgAkHDAE4EQANAIABBA3EEQCAAIAE6AAAgAEEBaiEADAELCyABQQh0IAFyIAFBEHRyIAFBGHRyIQMgBEF8cSIFQUBqIQYDQCAAIAZMBEAgACADNgIAIAAgAzYCBCAAIAM2AgggACADNgIMIAAgAzYCECAAIAM2AhQgACADNgIYIAAgAzYCHCAAIAM2AiAgACADNgIkIAAgAzYCKCAAIAM2AiwgACADNgIwIAAgAzYCNCAAIAM2AjggACADNgI8IABBQGshAAwBCwsDQCAAIAVIBEAgACADNgIAIABBBGohAAwBCwsLA0AgACAESARAIAAgAToAACAAQQFqIQAMAQsLIAQgAmsLUgEDfxAVIQMgACMBKAIAIgJqIgEgAkggAEEASnEgAUEASHIEQCABEBgaQQwQAUF/DwsgASADSgRAIAEQF0UEQEEMEAFBfw8LCyMBIAE2AgAgAgsRACABIAIgAEEBcUEQahEIAAsTACABIAIgAyAAQQNxQRJqEQkACxUAIAEgAiADIAQgAEEBcUEWahECAAsXACABIAIgAyAEIAUgAEEBcUEYahEKAAsZACABIAIgAyAEIAUgBiAAQQFxQRpqEQsACwcAQRwRBgALDwAgASAAQR9xQR1qEQAACxEAIAEgAiAAQQFxQT1qEQwACxMAIAEgAiADIABBAXFBP2oRAwALFgAgASACIAMgBCAAQQFxQcEAahENAAsWACABIAIgAyAEIABBB3FBwwBqEQEACxgAIAEgAiADIAQgBSAAQQdxQcsAahEHAAsaACABIAIgAyAEIAUgBiAAQQdxQdMAahEEAAsIAEEAEABBAAsIAEEBEABBAAsIAEECEABBAAsIAEEDEABBAAsIAEEEEABBAAsIAEEFEABBAAsGAEEGEAALBgBBBxAACwYAQQgQAAsGAEEJEAALBgBBChAACwYAQQsQAAsGAEEMEAALBgBBDRAACwvPsgEXAEGACAsSwCIAAFghAAD4IgAA+CIAAHghAEGgCAsisCIAAFghAAD4IgAAGCMAALAiAABYIQAAeCEA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UkcxMUxvZ3VlRWZmZWN0RQBQS040S09SRzE1TG9ndWVPc2NpbGxhdG9yRQBQTjRLT1JHMTVMb2d1ZU9zY2lsbGF0b3JFAFBLTjRLT1JHMTRMb2d1ZVByb2Nlc3NvckUAUE40S09SRzE0TG9ndWVQcm9jZXNzb3JFAHNldABOU3QzX18yMTJiYXNpY19zdHJpbmdJY05TXzExY2hhcl90cmFpdHNJY0VFTlNfOWFsbG9jYXRvckljRUVFRQBOU3QzX18yMjFfX2Jhc2ljX3N0cmluZ19jb21tb25JTGIxRUVFAE4zV0FCOVByb2Nlc3NvckUAdgBQcm9jZXNzb3IAaW5pdABpaWlpaWkAc2V0UGFyYW0AdmlpaWQAcHJvY2VzcwB2aWlpaWkAb25tZXNzYWdlAGlpaWlpaWkAZ2V0SW5zdGFuY2UAaWlpAE4xMGVtc2NyaXB0ZW4zdmFsRQBQS04zV0FCOVByb2Nlc3NvckUAUE4zV0FCOVByb2Nlc3NvckUAbGVuZ3RoAE42cGxhaXRzMTFHcmFpbkVuZ2luZUUATjZwbGFpdHM2RW5naW5lRQB2b2lkAGJvb2wAY2hhcgBzaWduZWQgY2hhcgB1bnNpZ25lZCBjaGFyAHNob3J0AHVuc2lnbmVkIHNob3J0AGludAB1bnNpZ25lZCBpbnQAbG9uZwB1bnNpZ25lZCBsb25nAGZsb2F0AGRvdWJsZQBzdGQ6OnN0cmluZwBzdGQ6OmJhc2ljX3N0cmluZzx1bnNpZ25lZCBjaGFyPgBzdGQ6OndzdHJpbmcAZW1zY3JpcHRlbjo6dmFsAGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGNoYXI+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHNpZ25lZCBjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxzaG9ydD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgc2hvcnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgaW50PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxsb25nPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBsb25nPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQ4X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQ4X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDE2X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQxNl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50MzJfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8ZmxvYXQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGRvdWJsZT4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8bG9uZyBkb3VibGU+AE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWVFRQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lkRUUATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJZkVFAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SW1FRQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lsRUUATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJakVFAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWlFRQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0l0RUUATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJc0VFAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWhFRQBOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lhRUUATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJY0VFAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0l3TlNfMTFjaGFyX3RyYWl0c0l3RUVOU185YWxsb2NhdG9ySXdFRUVFAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0loTlNfMTFjaGFyX3RyYWl0c0loRUVOU185YWxsb2NhdG9ySWhFRUVFAE4xMF9fY3h4YWJpdjExNl9fc2hpbV90eXBlX2luZm9FAFN0OXR5cGVfaW5mbwBOMTBfX2N4eGFiaXYxMjBfX3NpX2NsYXNzX3R5cGVfaW5mb0UATjEwX19jeHhhYml2MTE3X19jbGFzc190eXBlX2luZm9FAE4xMF9fY3h4YWJpdjExN19fcGJhc2VfdHlwZV9pbmZvRQBOMTBfX2N4eGFiaXYxMTlfX3BvaW50ZXJfdHlwZV9pbmZvRQBOMTBfX2N4eGFiaXYxMjBfX2Z1bmN0aW9uX3R5cGVfaW5mb0UATjEwX19jeHhhYml2MTI5X19wb2ludGVyX3RvX21lbWJlcl90eXBlX2luZm9FAE4xMF9fY3h4YWJpdjEyM19fZnVuZGFtZW50YWxfdHlwZV9pbmZvRQB2AERuAGIAYwBoAGEAcwB0AGkAagBsAG0AZgBkAE4xMF9fY3h4YWJpdjEyMV9fdm1pX2NsYXNzX3R5cGVfaW5mb0U=";
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
var tempDoublePtr=26032;
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
