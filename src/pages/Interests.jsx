import { useNavigate } from 'react-router-dom';

export default function Interests() {
  const navigate = useNavigate();
  const options = ['Singing', 'Dancing', 'Painting', 'Photography'];

  const selectInterest = (interest) => {
    localStorage.setItem('userInterest', interest);
    navigate('/dashboard'); // Dashboard ki velthundi
  };

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-8 text-[#0F252C]">Choose your interest</h1>
      <div className="grid grid-cols-2 gap-4">
        {options.map((opt) => (
          <button 
            key={opt} 
            onClick={() => selectInterest(opt)}
            className="p-6 bg-white border border-[#9FD3E3] rounded-xl hover:bg-[#9FD3E3] font-bold"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
