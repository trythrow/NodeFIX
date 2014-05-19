
var Fix = require('./fix.js'),
	tls = require('tls'),
	moment = require('moment');

// FIX account credentials
var host     = 'fix-md-ate.lmaxtrader.com';
var port	 = 443;
var username = 'yourusername';
var password = 'your password';


var loginMessage = Fix.message({
	BeginString: 'FIX.4.4',
	BodyLength: '%l',
	MsgType: 'A',
	MsgSeqNum: Fix.seqNum(),
	SenderCompID: 'Amaroks',
	SendingTime: moment().subtract("hours", 3).format("YYYYMMDD-HH:mm:ss.SSS"),
	TargetCompID: 'LMXBDM',
	Username: username,
	Password: password,
	EncryptMethod: 0,
	HeartBtInt: 30,
	ResetSeqNumFlag: 'Y'
}, true);

var quoteMessage = Fix.message({
	BeginString: 'FIX.4.4',
	//body length should always be %l
	// it will be replaced with actual length
	BodyLength: '%l',
	MsgType: 'V',
	MsgSeqNum: Fix.seqNum(),
	// username
	SenderCompID: 'Amaroks',
	// This should be very accurate otherwise the engine
	// will close the connection, I'm using momentjs to
	// have my time match the engine time
	SendingTime: moment().subtract("hours", 3).format("YYYYMMDD-HH:mm:ss.SSS"),
	TargetCompID: 'LMXBDM',
	MDReqID: 'EURUSD',
	SubscriptionRequestType: 1,
	MarketDepth: 1,
	MDUpdateType: 0,
	NoRelatedSym: 1,
	// 4001 = EURUSD
	SecurityID: 4001,
	SecurityIDSource: 8,
	NoMDEntryTypes: 2,
	MDEntryType: "0\x01269=1"
}, true);



var connectionOptions = {
	secureProtocol: 'TLSv1_method'
};

var cleartextStream = tls.connect(port, host,
		connectionOptions, function() {
			// connected to FIX server
			// send a FIX login message
			cleartextStream.write(loginMessage);
			// send a quote subscription message
			cleartextStream.write(quoteMessage);
		});


cleartextStream.setEncoding('utf8');

// parse response from FIX server
cleartextStream.on('data', function(data) {

	// parse the FIX message
	var data = Fix.read(data);


	// if server sent a heart beat, We need to respond
	if (data.MsgType === '1') {
		beat = Fix.message({
			BeginString: 'FIX.4.4',
			BodyLength: '%l',
			MsgType: 0,
			MsgSeqNum: Fix.seqNum(),
			SenderCompID: 'Amaroks',
			SendingTime: moment().subtract("hours", 3).format("YYYYMMDD-HH:mm:ss.SSS"),
			TargetCompID: 'LMXBDM',
			TestReqID: data.TestReqID
		}, true);

		cleartextStream.write(beat);
	}

	// server sent us quote update
	if (data.MsgType[0] === 'W') {

		console.log(data);
	}


});

cleartextStream.on('end', function() {
	console.log('FIX connection closed');
	process.exit(0);
});

cleartextStream.on('error', function(reason) {
	console.log('FIX connection error: ' + reason);
});