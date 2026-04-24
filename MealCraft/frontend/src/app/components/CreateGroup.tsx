import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function CreateGroup() {
    const navigate = useNavigate();

    const [groupName, setGroupName] = useState('');
    const [groupType, setGroupType] = useState<'private' | 'public'>('private');
    const [memberInput, setMemberInput] = useState('');
    const [members, setMembers] = useState<string[]>([]);

    const addMember = () => {
        const newMember = memberInput.trim();

        if (newMember && !members.includes(newMember)) {
            setMembers([...members, newMember]);
            setMemberInput('');
        }
    };

    const removeMember = (member: string) => {
        setMembers(members.filter((m) => m !== member));
    };

    const handleCreateGroup = () => {
        if (!groupName.trim()) {
            alert('Please enter a group name.');
            return;
        }

        const newGroup = {
            id: Date.now(),
            name: groupName.trim(),
            type: groupType,
            members,
            createdAt: new Date().toISOString(),
        };

        const existingGroups = JSON.parse(localStorage.getItem('mealcraftGroups') || '[]');
        const updatedGroups = [...existingGroups, newGroup];

        localStorage.setItem('mealcraftGroups', JSON.stringify(updatedGroups));
        localStorage.setItem('mealcraftActiveGroupId', String(newGroup.id));

        navigate('/home/group-chat', {
            state: {
                newGroup,
                activeGroupId: newGroup.id,
            },
        });
    };

    return (
        <div className="h-full overflow-y-auto bg-white pb-8">
            {/* Header */}
            <div className="px-5 py-5 border-b flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>

                <div>
                    <h1 className="text-2xl font-bold">Tạo nhóm mới</h1>
                    <p className="text-sm text-gray-500">Tạo group chat để cùng nấu ăn hoặc đặt món</p>
                </div>
            </div>

            <div className="px-5 pt-6 max-w-2xl mx-auto">
                {/* Group Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                        <Users className="w-12 h-12 text-green-500" />
                    </div>
                </div>

                {/* Group Name */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Tên nhóm</label>
                    <Input
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Ví dụ: Team ăn trưa, Hội mê đồ Việt..."
                        className="rounded-xl py-3"
                    />
                </div>

                {/* Group Type */}
                <div className="mb-6">
                    <label className="block font-semibold mb-3">Loại nhóm</label>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setGroupType('private')}
                            className={`rounded-2xl border p-4 text-left transition-all ${groupType === 'private'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 bg-white'
                                }`}
                        >
                            <p className="font-bold mb-1">Nhóm riêng</p>
                            <p className="text-sm text-gray-500">Chỉ thành viên được mời mới tham gia</p>
                        </button>

                        <button
                            onClick={() => setGroupType('public')}
                            className={`rounded-2xl border p-4 text-left transition-all ${groupType === 'public'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 bg-white'
                                }`}
                        >
                            <p className="font-bold mb-1">Nhóm công khai</p>
                            <p className="text-sm text-gray-500">Người dùng khác có thể tìm và tham gia</p>
                        </button>
                    </div>
                </div>

                {/* Add Members */}
                <div className="mb-6">
                    <label className="block font-semibold mb-2">Thêm thành viên</label>

                    <div className="flex gap-2 mb-3">
                        <Input
                            value={memberInput}
                            onChange={(e) => setMemberInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addMember();
                                }
                            }}
                            placeholder="Nhập email hoặc username"
                            className="rounded-xl"
                        />

                        <Button
                            onClick={addMember}
                            className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-4"
                        >
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>

                    {members.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {members.map((member) => (
                                <div
                                    key={member}
                                    className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-full text-sm"
                                >
                                    <span>{member}</span>
                                    <button onClick={() => removeMember(member)}>
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Preview */}
                <div className="rounded-[2rem] bg-gradient-to-br from-green-50 to-white border border-green-100 p-6 mb-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center flex-shrink-0 shadow-md">
                            <Users className="w-7 h-7 text-white" />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-between gap-3 mb-2">
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Xem trước nhóm</p>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {groupName || 'Chưa đặt tên nhóm'}
                                    </h3>
                                </div>

                                <span
                                    className={`px-4 py-2 rounded-full text-sm font-semibold ${groupType === 'private'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-blue-100 text-blue-700'
                                        }`}
                                >
                                    {groupType === 'private' ? 'Nhóm riêng' : 'Nhóm công khai'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-5">
                                <div className="rounded-2xl bg-white border border-gray-100 p-4">
                                    <p className="text-sm text-gray-500 mb-1">Số thành viên</p>
                                    <p className="text-xl font-bold text-gray-900">{members.length}</p>
                                </div>

                                <div className="rounded-2xl bg-white border border-gray-100 p-4">
                                    <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                                    <p className="text-xl font-bold text-green-600">Sẵn sàng</p>
                                </div>
                            </div>

                            {members.length > 0 && (
                                <div className="mt-5">
                                    <p className="text-sm text-gray-500 font-medium mb-2">
                                        Thành viên được mời
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {members.slice(0, 4).map((member) => (
                                            <span
                                                key={member}
                                                className="px-3 py-1.5 rounded-full bg-white border border-gray-100 text-sm text-gray-700"
                                            >
                                                {member}
                                            </span>
                                        ))}

                                        {members.length > 4 && (
                                            <span className="px-3 py-1.5 rounded-full bg-gray-100 text-sm text-gray-600">
                                                +{members.length - 4} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleCreateGroup}
                    className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-semibold text-base"
                >
                    Tạo nhóm
                </Button>
            </div>
        </div>
    );
}