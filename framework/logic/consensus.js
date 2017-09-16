"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function Consensus(e,t){library=t,this.pendingBlock=null,this.pendingVotes=null,this.votesKeySet={},e&&(0,_setImmediate3.default)(e,null,this)}var _setImmediate2=require("babel-runtime/core-js/set-immediate"),_setImmediate3=_interopRequireDefault(_setImmediate2),assert=require("assert"),crypto=require("crypto"),ByteBuffer=require("bytebuffer"),ip=require("ip"),bignum=require("bignumber"),ed=require("../helpers/ed.js"),slots=require("../helpers/slots.js"),library=null;Consensus.prototype.createVotes=function(e,t){var s=this.getVoteHash(t.height,t.id),r={height:t.height,id:t.id,signatures:[]};return e.forEach(function(e){r.signatures.push({key:e.publicKey.toString("hex"),sig:ed.Sign(s,e).toString("hex")})}),r},Consensus.prototype.verifyVote=function(e,t,s){try{var r=this.getVoteHash(e,t),n=new Buffer(s.sig,"hex"),i=new Buffer(s.key,"hex");return ed.Verify(r,n,i)}catch(e){return!1}},Consensus.prototype.getVoteHash=function(e,t){var s=new ByteBuffer;return s.writeLong(e),s.writeString(t),s.flip(),crypto.createHash("sha256").update(s.toBuffer()).digest()},Consensus.prototype.hasEnoughVotes=function(e){return e&&e.signatures&&e.signatures.length>2*slots.delegates/3},Consensus.prototype.hasEnoughVotesRemote=function(e){var t=Math.min(6,2*slots.delegates/3);return e&&e.signatures&&e.signatures.length>=t},Consensus.prototype.getPendingBlock=function(){return this.pendingBlock},Consensus.prototype.hasPendingBlock=function(e){return!!this.pendingBlock&&slots.getSlotNumber(this.pendingBlock.timestamp)==slots.getSlotNumber(e)},Consensus.prototype.setPendingBlock=function(e){this.pendingVotes=null,this.votesKeySet={},this.pendingBlock=e},Consensus.prototype.clearState=function(){this.pendingVotes=null,this.votesKeySet={},this.pendingBlock=null},Consensus.prototype.addPendingVotes=function(e){if(!this.pendingBlock||this.pendingBlock.height!=e.height||this.pendingBlock.id!=e.id)return this.pendingVotes;for(var t=0;t<e.signatures.length;++t){var s=e.signatures[t];this.votesKeySet[s.key]||this.verifyVote(e.height,e.id,s)&&(this.votesKeySet[s.key]=!0,this.pendingVotes||(this.pendingVotes={height:e.height,id:e.id,signatures:[]}),this.pendingVotes.signatures.push(s))}return this.pendingVotes},Consensus.prototype.createPropose=function(e,t,s){assert(e.publicKey.toString("hex")==t.delegate);var r={height:t.height,id:t.id,timestamp:t.timestamp,generatorPublicKey:t.delegate,address:s},n=this.getProposeHash(r);return r.hash=n.toString("hex"),r.signature=ed.Sign(n,e).toString("hex"),r},Consensus.prototype.getProposeHash=function(e){var t=new ByteBuffer;t.writeLong(e.height),t.writeString(e.id);for(var s=new Buffer(e.generatorPublicKey,"hex"),r=0;r<s.length;r++)t.writeByte(s[r]);t.writeInt(e.timestamp);var n=e.address.split(":");return assert(2==n.length),t.writeInt(ip.toLong(n[0])),t.writeInt(Number(n[1])),t.flip(),crypto.createHash("sha256").update(t.toBuffer()).digest()},Consensus.prototype.normalizeVotes=function(e){if(!library.validator.validate(e,{type:"object",properties:{height:{type:"integer"},id:{type:"string"},signatures:{type:"array",minLength:1,maxLength:101}},required:["height","id","signatures"]}))throw Error(library.validator.getLastError());return e},Consensus.prototype.acceptPropose=function(e){var t=this.getProposeHash(e);if(e.hash!=t.toString("hex"))return console.log("Propose hash is not correct"),!1;try{var s=new Buffer(e.signature,"hex"),r=new Buffer(e.generatorPublicKey,"hex");return!!ed.Verify(t,s,r)||(console.log("Vefify signature failed"),!1)}catch(e){return console.log("Verify signature exception: "+e.toString()),!1}},module.exports=Consensus;