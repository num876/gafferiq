/* eslint-disable */
"use client";

import React, { useState } from "react";
import { useGame } from "../../../context/GameContext";
import { Mail, MailOpen, AlertCircle, ChevronRight, CheckCircle, Trash2 } from "lucide-react";
import { InboxMessage } from "../../../db/storage";

export default function InboxPage() {
  const { activeSave, updateActiveSave } = useGame();
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);

  if (!activeSave) return null;

  const inbox = [...activeSave.inbox].reverse(); // newest first
  const selectedMessage = inbox.find(m => m.id === selectedMsgId) || null;

  const markAsRead = (id: string) => {
    const newState = { ...activeSave };
    const msg = newState.inbox.find(m => m.id === id);
    if (msg && !msg.read) {
      msg.read = true;
      updateActiveSave(newState);
    }
  };

  const handleSelect = (msg: InboxMessage) => {
    setSelectedMsgId(msg.id);
    markAsRead(msg.id);
  };

  const markAllRead = () => {
    const newState = { ...activeSave };
    newState.inbox.forEach(m => m.read = true);
    updateActiveSave(newState);
  };

  const deleteMessage = (id: string) => {
    const newState = { ...activeSave };
    newState.inbox = newState.inbox.filter(m => m.id !== id);
    if (selectedMsgId === id) setSelectedMsgId(null);
    updateActiveSave(newState);
  };

  const unreadCount = inbox.filter(m => !m.read).length;

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" />
            Manager Inbox
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Stay updated with news from the board, staff, and the press.
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={markAllRead}
            className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Messages List */}
        <div className="lg:col-span-1 glass-card border border-slate-850 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-850 bg-slate-900/50 shrink-0">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
              All Messages
              <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-[10px]">{unreadCount} Unread</span>
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {inbox.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Your inbox is empty.
              </div>
            ) : (
              <div className="flex flex-col">
                {inbox.map(msg => (
                  <button
                    key={msg.id}
                    onClick={() => handleSelect(msg)}
                    className={`w-full text-left p-4 border-b border-slate-850 transition hover:bg-slate-800/50 flex items-start gap-3 relative ${selectedMsgId === msg.id ? 'bg-slate-800/80 border-l-2 border-l-blue-500' : ''}`}
                  >
                    {!msg.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                    )}
                    <div className="shrink-0 mt-0.5">
                      {msg.type === "board" ? (
                        <AlertCircle className={`w-4 h-4 ${msg.read ? 'text-amber-500/50' : 'text-amber-500'}`} />
                      ) : msg.read ? (
                        <MailOpen className="w-4 h-4 text-slate-600" />
                      ) : (
                        <Mail className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <span className={`text-xs font-bold truncate ${msg.read ? 'text-slate-400' : 'text-slate-200'}`}>{msg.sender}</span>
                        <span className="text-[10px] text-slate-500 shrink-0">{msg.date}</span>
                      </div>
                      <h4 className={`text-sm truncate mb-1 ${msg.read ? 'text-slate-300' : 'text-white font-bold'}`}>{msg.subject}</h4>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="lg:col-span-2 glass-card border border-slate-850 rounded-2xl flex flex-col overflow-hidden">
          {selectedMessage ? (
            <>
              <div className="p-6 border-b border-slate-850 bg-slate-900/30 shrink-0">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{selectedMessage.subject}</h3>
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <span className="text-slate-400">From: <span className="text-slate-200">{selectedMessage.sender}</span></span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{selectedMessage.date}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-8 flex-1 overflow-y-auto custom-scrollbar bg-slate-950/20">
                
<div className="prose prose-invert prose-sm max-w-none text-slate-300">
  {selectedMessage.body.split('\n').map((para, i) => {
    // Check if this is a transfer offer data block
    if (para.includes('[TRANSFER_OFFER_DATA:')) {
      try {
        const jsonStr = para.replace('[TRANSFER_OFFER_DATA: ', '').replace(']', '');
        const data = JSON.parse(jsonStr);
        
        const handleAccept = () => {
          const newState = { ...activeSave };
          const player = newState.players.find(p => p.id === data.playerId);
          const buyer = newState.clubs.find(c => c.id === data.buyerId);
          if (player && buyer) {
            player.clubId = buyer.id;
            player.isTransferListed = false;
            newState.transferBudget += data.bidAmount;
            
            newState.transfersHistory.unshift({
              id: `trans_sold_${Date.now()}_${player.id}`,
              playerName: player.name,
              fromClubName: activeSave.clubs.find(c => c.id === activeSave.selectedClubId)?.name || "Your Club",
              toClubName: buyer.name,
              fee: data.bidAmount,
              type: "permanent",
              matchday: activeSave.currentMatchday
            });
            
            // Delete the message and update
            newState.inbox = newState.inbox.filter(m => m.id !== selectedMessage.id);
            setSelectedMsgId(null);
            updateActiveSave(newState);
          }
        };
        
        const handleReject = () => {
          const newState = { ...activeSave };
          newState.inbox = newState.inbox.filter(m => m.id !== selectedMessage.id);
          setSelectedMsgId(null);
          updateActiveSave(newState);
        };
        
        return (
          <div key={i} className="mt-8 p-4 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-between">
            <div className="text-sm">
              <p className="font-bold text-white mb-1">Transfer Offer Details</p>
              <p className="text-slate-400">Bid Amount: <span className="text-green-400 font-bold">£{(data.bidAmount / 1000000).toFixed(1)}M</span></p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleReject} className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded hover:bg-slate-700 transition">Reject</button>
              <button onClick={handleAccept} className="px-4 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-500 transition">Accept Offer</button>
            </div>
          </div>
        );
      } catch (e) {
        return null;
      }
    }
    return <p key={i} className="mb-4 leading-relaxed">{para}</p>;
  })}
</div>

              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
              <Mail className="w-12 h-12 mb-4 opacity-20" />
              <h3 className="text-lg font-bold text-slate-400 mb-2">No Message Selected</h3>
              <p className="text-sm">Select a message from the list to read it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
