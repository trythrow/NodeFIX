NodeFIX
=======

NodeJS FIX protocol message builder and parser


a connection and message exchange example is included in this repo, the example subscribes to a symbol quotes, You can subscribe to multiple symbols if you wish by sending multiple messages, groups in message is not supported yet, but can parse messages even when it contains groups.


After running the included example, the FIX server will push to you quotes in a FIX message like the following

```
8=FIX.4.4|9=166|35=W|49=LMXBDM|56=Amaroks|34=3|52=20140519-10:36:00.408|262=EURUSD|48=4001|22=8|268=2|269=0|270=1.37186|271=50|272=20140519|273=10:36:00.320|269=1|270=1.37188|271=50|10=140|
```
and using the Fix.read() method parses the above FIX message and transform it into a javascript object like the following

```
{ BeginString: 'FIX.4.4',
  BodyLength: '168',
  MsgType: 'W',
  SenderCompID: 'LMXBDM',
  TargetCompID: 'Amaroks',
  MsgSeqNum: '202',
  SendingTime: '20140519-09:19:42.777',
  MDReqID: 'EURUSD',
  SecurityID: '4001',
  SecurityIDSource: '8',
  NoMDEntries: '2',
  MDEntryType: [ '0', '1' ],
  MDEntryPx: [ '1.3711', '1.37113' ],
  MDEntrySize: [ '60', '250' ],
  MDEntryDate: '20140519',
  MDEntryTime: '09:19:42.654',
  CheckSum: '010' 
  }
```

NodeFIX has been tested with demo account from LMAX
https://testapi.lmaxtrader.com/


MIT License

Copyright (C) 2014 Ahmad Said

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

