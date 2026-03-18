import duneMovie from '@/assets/events/dune-movie.jpg';
import coldplayConcert from '@/assets/events/coldplay-concert.jpg';
import iplCricket from '@/assets/events/ipl-cricket.jpg';
import standupComedy from '@/assets/events/standup-comedy.jpg';
import arijitConcert from '@/assets/events/arijit-concert.jpg';
import pushpaMovie from '@/assets/events/pushpa-movie.jpg';
import indieLive from '@/assets/events/indie-live.jpg';
import islFootball from '@/assets/events/isl-football.jpg';

export interface Event {
  id: string;
  title: string;
  category: 'movies' | 'concerts' | 'sports' | 'comedy' | 'live';
  image: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  language?: string;
  genre?: string;
  rating?: number;
  price: number;
  description: string;
  duration?: string;
  soldCount?: number; // for best-selling sort
}

export interface Companion {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  avatar: string;
  interests: string[];
  bio: string;
}

export const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'];

export const categories = [
  { id: 'all',      label: 'All Events',   icon: '🎭' },
  { id: 'movies',   label: 'Movies',       icon: '🎬' },
  { id: 'concerts', label: 'Concerts',     icon: '🎵' },
  { id: 'sports',   label: 'Sports',       icon: '⚽' },
  { id: 'comedy',   label: 'Comedy',       icon: '😂' },
  { id: 'live',     label: 'Live Events',  icon: '🎤' },
];

export const events: Event[] = [
  // ── MUMBAI ──────────────────────────────────────────────────
  {
    id: '1',
    title: 'Dune: Part Three',
    category: 'movies',
    image: duneMovie,
    date: '2026-04-25',
    time: '7:00 PM',
    venue: 'PVR IMAX Phoenix',
    city: 'Mumbai',
    language: 'English',
    genre: 'Sci-Fi, Adventure',
    rating: 9.2,
    price: 450,
    soldCount: 8900,
    description: 'The epic conclusion to the Dune saga. Paul Atreides unites with the Fremen to lead a rebellion against House Harkonnen.',
    duration: '2h 45m',
  },
  {
    id: '2',
    title: 'Coldplay: Music of the Spheres',
    category: 'concerts',
    image: coldplayConcert,
    date: '2026-05-15',
    time: '6:30 PM',
    venue: 'DY Patil Stadium',
    city: 'Mumbai',
    genre: 'Rock, Pop',
    price: 2500,
    soldCount: 12000,
    description: 'Experience the magic of Coldplay live! Join millions of fans worldwide as Chris Martin and band bring their spectacular world tour to India.',
    duration: '3h',
  },
  {
    id: '3',
    title: 'IPL 2026: Mumbai vs Chennai',
    category: 'sports',
    image: iplCricket,
    date: '2026-06-20',
    time: '7:30 PM',
    venue: 'Wankhede Stadium',
    city: 'Mumbai',
    genre: 'Cricket',
    price: 1500,
    soldCount: 9800,
    description: 'The biggest rivalry in IPL history! Watch Mumbai Indians take on Chennai Super Kings in this electrifying clash.',
    duration: '4h',
  },
  {
    id: '4',
    title: 'Zakir Khan Live',
    category: 'comedy',
    image: standupComedy,
    date: '2026-04-01',
    time: '8:00 PM',
    venue: 'NCPA Mumbai',
    city: 'Mumbai',
    language: 'Hindi',
    genre: 'Stand-up Comedy',
    price: 800,
    soldCount: 3200,
    description: 'Sakht launda is back! Join Zakir Khan for an evening of laughter, stories, and unforgettable comedy.',
    duration: '2h',
  },
  {
    id: '9',
    title: 'Sunburn Arena: Martin Garrix',
    category: 'concerts',
    image: coldplayConcert,
    date: '2026-05-02',
    time: '8:00 PM',
    venue: 'MMRDA Grounds BKC',
    city: 'Mumbai',
    genre: 'EDM, Electronic',
    price: 1800,
    soldCount: 7400,
    description: 'Martin Garrix brings his electrifying set to Mumbai! Get ready for a night of world-class EDM.',
    duration: '4h',
  },
  {
    id: '10',
    title: 'Kapil Sharma: Unstoppable',
    category: 'comedy',
    image: standupComedy,
    date: '2026-04-18',
    time: '7:30 PM',
    venue: 'Nita Mukesh Ambani Cultural Centre',
    city: 'Mumbai',
    language: 'Hindi',
    genre: 'Stand-up Comedy',
    price: 1200,
    soldCount: 5600,
    description: "India's favourite comedian returns with an all-new live show packed with his signature wit and charm.",
    duration: '2h 30m',
  },
  {
    id: '11',
    title: 'Stree 3',
    category: 'movies',
    image: pushpaMovie,
    date: '2026-06-05',
    time: '9:00 PM',
    venue: 'Cinepolis Andheri',
    city: 'Mumbai',
    language: 'Hindi',
    genre: 'Horror, Comedy',
    rating: 8.5,
    price: 250,
    soldCount: 6100,
    description: 'The cult horror-comedy franchise is back! Stree returns to haunt the big screen with even more laughs and scares.',
    duration: '2h 10m',
  },

  // ── DELHI ──────────────────────────────────────────────────
  {
    id: '5',
    title: 'Arijit Singh Live in Concert',
    category: 'concerts',
    image: arijitConcert,
    date: '2026-05-28',
    time: '7:00 PM',
    venue: 'JLN Stadium',
    city: 'Delhi',
    genre: 'Bollywood, Playback',
    price: 3000,
    soldCount: 14500,
    description: "The voice of a generation performs live. Experience Arijit Singh's soul-stirring melodies in an unforgettable concert.",
    duration: '3h 30m',
  },
  {
    id: '12',
    title: 'WWE Supershow India',
    category: 'sports',
    image: islFootball,
    date: '2026-05-10',
    time: '6:00 PM',
    venue: 'Indira Gandhi Indoor Stadium',
    city: 'Delhi',
    genre: 'Wrestling, Entertainment',
    price: 2200,
    soldCount: 11000,
    description: 'WWE superstars live in India! Witness the spectacle of WWE Raw in Delhi for the first time ever.',
    duration: '3h',
  },
  {
    id: '13',
    title: 'Shreya Ghoshal: Swar Utsav',
    category: 'live',
    image: arijitConcert,
    date: '2026-04-12',
    time: '7:00 PM',
    venue: 'Siri Fort Auditorium',
    city: 'Delhi',
    language: 'Hindi',
    genre: 'Classical, Bollywood',
    rating: 9.0,
    price: 1500,
    soldCount: 4200,
    description: "An enchanting evening with the nightingale of Bollywood. Shreya Ghoshal performs her greatest hits live.",
    duration: '2h 30m',
  },
  {
    id: '14',
    title: 'Vir Das: Fool For Life',
    category: 'comedy',
    image: standupComedy,
    date: '2026-04-25',
    time: '8:00 PM',
    venue: 'Kingdom of Dreams',
    city: 'Delhi',
    language: 'English',
    genre: 'Stand-up Comedy',
    price: 999,
    soldCount: 2800,
    description: 'Internationally acclaimed comedian Vir Das returns to Delhi with a brand new hour of stand-up.',
    duration: '1h 30m',
  },

  // ── BANGALORE ──────────────────────────────────────────────
  {
    id: '6',
    title: 'Pushpa 3: The Rule',
    category: 'movies',
    image: pushpaMovie,
    date: '2026-04-28',
    time: '9:00 PM',
    venue: 'INOX Garuda Mall',
    city: 'Bangalore',
    language: 'Telugu',
    genre: 'Action, Drama',
    rating: 8.8,
    price: 350,
    soldCount: 7700,
    description: 'Pushpa Raj returns for the ultimate showdown. The fire is burning brighter than ever.',
    duration: '3h 15m',
  },
  {
    id: '7',
    title: 'Prateek Kuhad: Silhouettes Tour',
    category: 'live',
    image: indieLive,
    date: '2026-05-10',
    time: '8:00 PM',
    venue: 'Phoenix Marketcity',
    city: 'Bangalore',
    genre: 'Indie, Folk',
    price: 1800,
    soldCount: 3100,
    description: 'Join indie sensation Prateek Kuhad as he performs his biggest hits and new tracks from his latest album.',
    duration: '2h 30m',
  },
  {
    id: '15',
    title: 'NH7 Weekender Bangalore',
    category: 'concerts',
    image: indieLive,
    date: '2026-05-17',
    time: '4:00 PM',
    venue: 'NICE Grounds',
    city: 'Bangalore',
    genre: 'Indie, Alternative, Folk',
    price: 2200,
    soldCount: 8500,
    description: 'The happiest music festival on earth returns! 3 stages, 30+ artists, and 2 days of unforgettable music.',
    duration: '8h',
  },
  {
    id: '16',
    title: 'RCB vs KKR IPL 2026',
    category: 'sports',
    image: iplCricket,
    date: '2026-06-08',
    time: '7:30 PM',
    venue: 'M. Chinnaswamy Stadium',
    city: 'Bangalore',
    genre: 'Cricket',
    price: 1200,
    soldCount: 8900,
    description: 'Ee Sala Cup Namde! Royal Challengers Bangalore face KKR in a must-watch IPL clash under the lights.',
    duration: '4h',
  },

  // ── KOLKATA ────────────────────────────────────────────────
  {
    id: '8',
    title: 'ISL Final 2026',
    category: 'sports',
    image: islFootball,
    date: '2026-06-15',
    time: '6:00 PM',
    venue: 'Salt Lake Stadium',
    city: 'Kolkata',
    genre: 'Football',
    price: 1200,
    soldCount: 6600,
    description: 'Witness the thrilling conclusion of the Indian Super League. Two titans battle for glory!',
    duration: '2h 30m',
  },
  {
    id: '17',
    title: 'Durga Puja Cultural Night',
    category: 'live',
    image: indieLive,
    date: '2026-04-20',
    time: '6:30 PM',
    venue: 'Rabindra Sadan',
    city: 'Kolkata',
    language: 'Bengali',
    genre: 'Classical, Cultural',
    rating: 8.1,
    price: 500,
    soldCount: 2200,
    description: 'A spectacular evening of classical dance, music and theatre celebrating the cultural heritage of Bengal.',
    duration: '3h',
  },

  // ── HYDERABAD ──────────────────────────────────────────────
  {
    id: '18',
    title: 'Kalki 2: Beyond Time',
    category: 'movies',
    image: duneMovie,
    date: '2026-05-05',
    time: '8:00 PM',
    venue: 'AMB Cinemas',
    city: 'Hyderabad',
    language: 'Telugu',
    genre: 'Sci-Fi, Mythology',
    rating: 8.9,
    price: 400,
    soldCount: 9200,
    description: 'The sequel to the blockbuster Kalki 2898 AD. Prabhas returns in the most anticipated Indian film of 2026.',
    duration: '3h',
  },
  {
    id: '19',
    title: 'Diljit Dosanjh: Dil-Luminati Tour',
    category: 'concerts',
    image: arijitConcert,
    date: '2026-05-22',
    time: '7:00 PM',
    venue: 'GMR Arena',
    city: 'Hyderabad',
    language: 'Punjabi',
    genre: 'Punjabi, Pop',
    price: 2800,
    soldCount: 13000,
    description: "Diljit Dosanjh's record-breaking Dil-Luminati Tour hits Hyderabad! A night of chart-topping Punjabi hits.",
    duration: '3h',
  },

  // ── CHENNAI ────────────────────────────────────────────────
  {
    id: '20',
    title: 'AR Rahman: Connections Tour',
    category: 'concerts',
    image: arijitConcert,
    date: '2026-06-01',
    time: '6:30 PM',
    venue: 'YMCA Nandanam',
    city: 'Chennai',
    language: 'Tamil',
    genre: 'Fusion, Classical, Bollywood',
    rating: 9.5,
    price: 3500,
    soldCount: 16000,
    description: "The Mozart of Madras performs live in his home city. AR Rahman's Connections Tour promises a magical evening.",
    duration: '3h 30m',
  },
  {
    id: '21',
    title: 'CSK vs MI IPL 2026',
    category: 'sports',
    image: iplCricket,
    date: '2026-05-30',
    time: '7:30 PM',
    venue: 'MA Chidambaram Stadium',
    city: 'Chennai',
    genre: 'Cricket',
    price: 1800,
    soldCount: 10500,
    description: 'Whistle Podu! CSK host MI in what promises to be one of the most electric atmospheres in cricket.',
    duration: '4h',
  },

  // ── PUNE ───────────────────────────────────────────────────
  {
    id: '22',
    title: 'Sunburn Festival 2026',
    category: 'concerts',
    image: coldplayConcert,
    date: '2026-06-28',
    time: '2:00 PM',
    venue: 'Aamby Valley City',
    city: 'Pune',
    genre: 'EDM, Trance, House',
    price: 3200,
    soldCount: 18000,
    description: "Asia's biggest EDM festival returns! 50+ international DJs across 5 stages for 3 days of non-stop music.",
    duration: '12h',
  },
  {
    id: '23',
    title: 'Rohan Joshi: Adult Content',
    category: 'comedy',
    image: standupComedy,
    date: '2026-05-08',
    time: '8:00 PM',
    venue: 'Bal Gandharva Rang Mandir',
    city: 'Pune',
    language: 'English',
    genre: 'Stand-up Comedy',
    price: 699,
    soldCount: 1900,
    description: 'AIB co-founder Rohan Joshi is back on stage with sharp observations and brutal honesty.',
    duration: '1h 15m',
  },
];

export const companions: Companion[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    age: 26,
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    interests: ['Movies', 'Music', 'Travel'],
    bio: 'Movie buff who loves discussing films over coffee. Always up for Marvel marathons!',
  },
  {
    id: '2',
    name: 'Rahul Verma',
    age: 28,
    gender: 'male',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    interests: ['Sports', 'Cricket', 'Gaming'],
    bio: 'Die-hard cricket fan. Looking for fellow enthusiasts to watch matches together!',
  },
  {
    id: '3',
    name: 'Ananya Desai',
    age: 24,
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    interests: ['Comedy', 'Stand-up', 'Books'],
    bio: 'Comedy show addict! Love laughing until my stomach hurts.',
  },
  {
    id: '4',
    name: 'Arjun Kapoor',
    age: 30,
    gender: 'male',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    interests: ['Concerts', 'Rock Music', 'Photography'],
    bio: 'Music is life! Always chasing the next great live performance.',
  },
  {
    id: '5',
    name: 'Sneha Reddy',
    age: 27,
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    interests: ['Live Events', 'Art', 'Theatre'],
    bio: 'Art and culture enthusiast. Love exploring new experiences with like-minded people.',
  },
  {
    id: '6',
    name: 'Vikram Singh',
    age: 32,
    gender: 'male',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    interests: ['Sports', 'Football', 'Fitness'],
    bio: 'Sports fanatic! Nothing beats watching a match live at the stadium.',
  },
];

export const generateSeats = () => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const seatsPerRow = 12;
  const seats: {
    id: string;
    row: string;
    number: number;
    status: 'available' | 'booked' | 'premium';
    price: number;
  }[] = [];

  rows.forEach((row, rowIndex) => {
    for (let i = 1; i <= seatsPerRow; i++) {
      const isPremium = rowIndex >= 4 && rowIndex <= 6;
      const isBooked  = Math.random() < 0.3;
      seats.push({
        id:     `${row}${i}`,
        row,
        number: i,
        status: isBooked ? 'booked' : isPremium ? 'premium' : 'available',
        price:  isPremium ? 650 : rowIndex < 3 ? 250 : 450,
      });
    }
  });

  return seats;
};
