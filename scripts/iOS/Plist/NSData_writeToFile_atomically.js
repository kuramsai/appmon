/**
 * Copyright (c) 2016 Nishant Das Patnaik.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

'use strict';
var resolver = new ApiResolver('objc');
var NSDataWriteToFile = {};
resolver.enumerateMatches('-[* writeToFile*]', {
  onMatch: function (match) {
    if (match.name === '-[NSData writeToFile:atomically:]') {
      NSDataWriteToFile.name = match.name;
      NSDataWriteToFile.address = match.address;
    }
  },
  onComplete: function () {}
});
if (NSDataWriteToFile.address) {
  Interceptor.attach(NSDataWriteToFile.address, {
    onEnter: function (args) {
      var filePath = new ObjC.Object(args[2]);
      if (filePath.toString().match(/\.plist$/)) {
        var obj = new ObjC.Object(args[0]);
        var fileContents = Memory.readUtf8String(obj.bytes(), obj.length());
        var log = {};
        log['filePath'] = filePath.toString();
        log['fileContents'] = fileContents.toString();

        /*   --- Payload Header --- */
        var send_data = {};
        send_data.time = new Date();
        send_data.txnType = 'Core Data';
        send_data.lib = 'libobjc.a.dylib';
        send_data.method = '-[NSData writeToFile:atomically:]';
        send_data.artifact = [];
        /*   --- Payload Body --- */
        var data = {};
        data.name = "PList File Write";
        data.value = log;
        data.argSeq = 0;
        send_data.artifact.push(data);
        // send(JSON.stringify(send_data));
        console.log(JSON.stringify(send_data));
      }
    }
  });
}