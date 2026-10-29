import { Trophy, Medal } from 'lucide-react';

const Leaderboard = () => {
  const users = [
    { rank: 1, name: 'Bhavya', skill: 'Web Dev', score: 98, badge: '🥇' },
    { rank: 2, name: 'Rahul', skill: 'Singing', score: 95, badge: '🥈' },
    { rank: 3, name: 'Ananya', skill: 'Dancing', score: 92, badge: '🥉' },
    { rank: 4, name: 'Vijay', skill: 'Drawing', score: 89 },
    { rank: 5, name: 'Sita', skill: 'Photography', score: 85 },
    { rank: 6, name: 'Arjun', skill: 'Cloud & DevOps', score: 82 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-[#0F252C] flex items-center gap-2">
          <Trophy size={36} />
          Global Leaderboard
        </h1>
        <p className="text-[#405D66]">Top talent on TalentMesh</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#D1E5EA]">
            <tr>
              <th className="p-4 font-bold text-[#0F252C]">Rank</th>
              <th className="p-4 font-bold text-[#0F252C]">Name</th>
              <th className="p-4 font-bold text-[#0F252C]">Top Skill</th>
              <th className="p-4 font-bold text-[#0F252C]">Score</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr 
                key={index} 
                className={`border-b border-gray-50 hover:bg-[#F4F7F8] transition ${
                  index < 3 ? 'bg-gradient-to-r from-transparent to-[#D1E5EA] bg-opacity-30' : ''
                }`}
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {user.badge && <span className="text-2xl">{user.badge}</span>}
                    {!user.badge && (
                      <span className="font-black text-[#9FD3E3] text-lg">#{user.rank}</span>
                    )}
                  </div>
                </td>
                <td className="p-4 font-semibold text-[#0F252C]">{user.name}</td>
                <td className="p-4 text-[#405D66]">{user.skill}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#0F252C] h-2 rounded-full"
                        style={{ width: `${(user.score / 100) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-[#0F252C] min-w-fit">{user.score}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-2xl p-6 text-white shadow">
          <Medal className="mb-2" size={32} />
          <p className="text-sm opacity-90">1st Place</p>
          <p className="text-2xl font-black">{users[0].name}</p>
        </div>
        <div className="bg-gradient-to-br from-[#C0C0C0] to-[#A9A9A9] rounded-2xl p-6 text-white shadow">
          <Medal className="mb-2" size={32} />
          <p className="text-sm opacity-90">2nd Place</p>
          <p className="text-2xl font-black">{users[1].name}</p>
        </div>
        <div className="bg-gradient-to-br from-[#CD7F32] to-[#8B4513] rounded-2xl p-6 text-white shadow">
          <Medal className="mb-2" size={32} />
          <p className="text-sm opacity-90">3rd Place</p>
          <p className="text-2xl font-black">{users[2].name}</p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
