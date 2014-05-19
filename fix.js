/**
 * NodeFIX
 * FIX protocol message builder and reader
 *
 * Version: 1.0
 *
 * Copyright (c) 2014 Ahmad Said
 * NodeFIX is currently available for use in all personal or commercial projects 
 * under both the MIT (http://www.opensource.org/licenses/mit-license.php) and GPL 
 * version 2.0 (http://www.gnu.org/licenses/gpl-2.0.html) licenses. This means that you can 
 * choose the license that best suits your project and use it accordingly. 
 *
 * Although not required, the author would appreciate an email letting him 
 * know of any substantial use of NodeFIX.  You can reach the author at: 
 * mody at amaroks dot com
 * 
 * */

module.exports = (function() {
	function Fix() {

		// incomplete FIX dict
		this.DICT = {
			BeginString: 8,
			BodyLength: 9,
			MsgType: 35,
			SenderCompID: 49,
			TargetCompID: 56,
			MsgSeqNum: 34,
			PossDupFlag: 43,
			PossResend: 97,
			SendingTime: 52,
			OrigSendingTime: 122,
			TestReqID: 112,
			BeginSeqNo: 7,
			EndSeqNo: 16,
			RefSeqNum: 45,
			RefTagID: 371,
			RefMsgType: 372,
			SessionRejectReason: 373,
			Text: 58,
			GapFillFlag: 123,
			NewSeqNo: 36,
			OrderID: 37,
			SecondaryExecID: 527,
			ClOrdID: 11,
			OrigClOrdID: 41,
			OrdStatusReqID: 790,
			ExecID: 17,
			ExecType: 150,
			OrdStatus: 39,
			OrdRejReason: 103,
			Account: 1,
			Side: 54,
			OrdType: 40,
			Price: 44,
			StopPx: 99,
			TimeInForce: 59,
			LastQty: 32,
			LastPx: 31,
			LeavesQty: 151,
			CumQty: 14,
			AvgPx: 6,
			TransactTime: 60,
			SettlDate: 64,
			CxlRejResponseTo: 434,
			CxlRejReason: 102,
			EncryptMethod: 98,
			HeartBtInt: 108,
			ResetSeqNumFlag: 141,
			MaxMessageSize: 383,
			Username: 553,
			Password: 554,
			ExecInst: 18,
			TradeRequestID: 568,
			TradeRequestType: 569,
			SubscriptionRequestType: 263,
			LastRptRequested: 912,
			TradeDate: 75,
			TotNumTradeReports: 748,
			TradeRequestResult: 749,
			TradeRequestStatus: 750,
			CheckSum: 10,
			SecurityID: 48,
			SecurityIDSource: 22,
			OrderQty: 38,
			NoDates: 580,
			NoSides: 552,
			MDEntryType: 269,
			MDReqID: 262,
			MarketDepth: 264,
			MDUpdateType: 265,
			NoRelatedSym: 146,
			NoMDEntryTypes: 267,
			NoMDEntries: 268,
			MDEntryPx: 270,
			MDEntrySize: 271,
			MDEntryDate: 272,
			MDEntryTime: 273
		};
		// SOH delimiter
		this.SOH = "\x01";
		// empty string
		this.E_STR = "";
		// trimmed message
		this.TRIMED = this.E_STR;
		// SeqNum generator
		this.SEQNUM = 0;
	}
	/**
	 * FIX message constuctor
	 *
	 * @param {object} obj
	 * @param {boolean} T_SOH
	 * @returns {String}
	 */
	Fix.prototype.message = function(obj, add_tsoh) {
		var message = this.E_STR, i = 0;

		// clear any previous values
		this.TRIMED = this.E_STR;

		for (var key in obj) {
			message += this.DICT[key] + "=" + obj[key];
			i++;

			if (add_tsoh) {
				message += this.SOH;
			}

			var not = [this.DICT.BeginString, this.DICT.BodyLength, this.DICT.CheckSum];

			if (not.indexOf(this.DICT[key]) === -1) {
				this.TRIMED += this.DICT[key] + "=" + obj[key] + this.SOH;
			}
		}

		message = message.replace('%l', this._bodyLength());
		message += this.DICT.CheckSum + '=' + this._checkSum(message, message.length) + this.SOH;

		return message;
	};

	Fix.prototype._bodyLength = function() {
		return this.TRIMED.length;
	};

	/**
	 * FIX message checksum calculator
	 * 
	 * @param {String} buff
	 * @param {Number} buffLength
	 * @returns {Number}
	 */
	Fix.prototype._checkSum = function(buff, buffLength) {
		for (var idx = 0, cks = 0; idx < buffLength; cks += this._ord(buff[idx++])) {
		}

		var sum = cks % 256;

		switch (sum.toString().length) {
			case 1:
				sum = '00' + sum;
				break;
			case 2:
				sum = '0' + sum;
				break;
		}

		return sum;
	};

	Fix.prototype._ord = function(str) {
		var code = str.charCodeAt(0);

		// High surrogate (could change last hex to 0xDB7F to treat high private surrogates as single characters)
		if (0xD800 <= code && code <= 0xDBFF) {
			var hi = code;
			if (str.length === 1) {
				return code;
				// we could also throw an error as it is not a complete character, but someone may want to know
			}
			var low = str.charCodeAt(1);
			return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
		}

		// Low surrogate
		if (0xDC00 <= code && code <= 0xDFFF) {
			return code;
			// we could also throw an error as it is not a complete character, but someone may want to know
		}
		return code;
	};

	/**
	 * FIX message parser
	 * 
	 * @param {string} fixString
	 * @returns {Array}
	 */
	Fix.prototype.read = function(fixString) {
		if (!fixString) {
			throw new Error("Please provide FIX message");
		}
		var itemsArray = fixString.split(/\x01/);
		var flippedDic = this._flipp(this.DICT);
		var newObject = {};

		itemsArray.forEach(function(value) {
			var item = value.split("=");
			if (typeof flippedDic[item[0]] !== 'undefined') {
				if (typeof newObject[flippedDic[item[0]]] !== 'undefined') {
					if (typeof newObject[flippedDic[item[0]]] === 'object') {
						newObject[flippedDic[item[0]]].push(item[1]);
					} else {
						newObject[flippedDic[item[0]]] = [
							newObject[flippedDic[item[0]]],
							item[1]
						];
					}
				} else {
					newObject[flippedDic[item[0]]] = item[1];
				}
			} else {
				if (item[0] !== "") {
					newObject[item[0]] = item[1];
				}
			}
		});

		return newObject;
	};

	/**
	 * resets sequence number
	 * @returns {undefined}
	 */
	Fix.prototype.resetSeq = function() {
		this.SEQNUM = 1;
	};

	Fix.prototype._flipp = function(trans) {
		var key, tmp_ar = {};

		// Duck-type check for our own array()-created PHPJS_Array
		if (trans && typeof trans === 'object' && trans.change_key_case) {
			return trans.flip();
		}

		for (key in trans) {
			if (!trans.hasOwnProperty(key)) {
				continue;
			}
			tmp_ar[trans[key]] = key;
		}

		return tmp_ar;
	};

	/**
	 * generates a sequence number
	 * @returns {Number}
	 */
	Fix.prototype.seqNum = function() {
		this.SEQNUM++;
		return this.SEQNUM;
	};
	return new Fix();
})();
