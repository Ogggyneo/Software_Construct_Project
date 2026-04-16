import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ChevronLeft, Info, Plus, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

const initialMessages: Message[] = [
  {
    id: '1',
    user: 'Minh Anh',
    text: 'Mọi người ơi, hôm nay ăn cơm gà Hải Nam ở quán cũ nhé? Mình thấy đang có mã giảm giá 30%.',
    timestamp: '10:30',
    isMe: false,
  },
  {
    id: '2',
    user: 'Hoàng Long',
    text: 'Duyệt luôn! Mình một suất đùi gà quay ít cơm nhé.',
    timestamp: '10:32',
    isMe: false,
  },
  {
    id: '3',
    user: 'Bạn',
    text: 'Mình gửi link gom nhóm grab nhé: abc_grab.vn.com . Mọi người tự trả tiền nhé',
    timestamp: '10:35',
    isMe: true,
  },
  {
    id: '4',
    user: 'Minh Anh',
    text: 'Ok mình thấy rồi. Còn thiếu sếp tổng nữa là đủ đơn để áp mã giảm giá 50k nè.',
    timestamp: '10:36',
    isMe: false,
  },
  {
    id: '5',
    user: 'Hoàng Long',
    text: 'Sếp đang họp rồi, chắc 11h mới xong. Mọi người cứ chốt trước đi.',
    timestamp: '10:40',
    isMe: false,
  },
];

export function GroupChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      user: 'Bạn',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h3 className="font-bold text-base">Nhóm Cơm Trưa VP</h3>
        </div>
        <button className="p-1">
          <Info className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Deadline Banner */}
      <div className="bg-red-50 border-b border-red-100 px-4 py-2.5 flex items-center gap-2">
        <div className="w-4 h-4 rounded-full border-2 border-red-500 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
        </div>
        <span className="text-sm text-red-600 font-medium uppercase tracking-wide">
          Hết hạn đặt sau 15:20
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-white">
        {/* Date divider */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gray-100 px-4 py-1.5 rounded-full">
            <span className="text-xs text-gray-500 font-medium uppercase">Hôm nay</span>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {message.isMe ? (
                // My message (right aligned, green)
                <div className="flex justify-end mb-1">
                  <div className="max-w-[75%]">
                    <div className="bg-green-500 text-white px-4 py-3 rounded-2xl rounded-tr-sm">
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 text-right">{message.timestamp}</p>
                  </div>
                </div>
              ) : (
                // Others' messages (left aligned, gray)
                <div className="flex gap-2 mb-1">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
                      {message.user.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 max-w-[75%]">
                    <p className="text-xs text-gray-500 font-medium mb-1">{message.user}</p>
                    <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{message.timestamp}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t px-4 py-3 pb-6">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Nhập tin nhắn hoặc món ăn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="flex-1 border-gray-300 rounded-full text-sm px-4"
          />
          <Button
            onClick={sendMessage}
            className="bg-green-500 hover:bg-green-600 rounded-full w-10 h-10 p-0"
            disabled={!newMessage.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}