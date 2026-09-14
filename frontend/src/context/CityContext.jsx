import React, { createContext, useContext, useState } from 'react';

const CityContext = createContext();

export const POPULAR_CITIES = [
  {
    name: 'Mumbai',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" className="w-10 h-10 mx-auto stroke-[1.8]">
        <path d="M12 52h40M16 52V28l16-12 16 12v24M24 52V36h16v16M28 36v-6a4 4 0 0 1 8 0v6M20 28v-8l12-8 12 8v8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M32 16v-4M22 48h4M38 48h4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'Delhi-NCR',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" className="w-10 h-10 mx-auto stroke-[1.8]">
        <path d="M14 52h36M18 52V24l14-10 14 10v28M24 52V34h16v18M26 24h12M32 14v10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 40h4M38 40h4M22 46h4M38 46h4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    name: 'Bengaluru',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" className="w-10 h-10 mx-auto stroke-[1.8]">
        <path d="M10 52h44M16 52V32l16-16 16 16v20M24 52V38h16v14M28 26h8M32 16v10" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="32" cy="32" r="3"/>
      </svg>
    ),
  },
  {
    name: 'Hyderabad',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" className="w-10 h-10 mx-auto stroke-[1.8]">
        <path d="M10 52h44M16 52V18M48 52V18M16 26h32M16 38h32M24 52V38a8 8 0 0 1 16 0v14M12 18l4-6 4 6M44 18l4-6 4 6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'Chandigarh',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" className="w-10 h-10 mx-auto stroke-[1.8]">
        <path d="M14 52h36M32 52V24M32 24C24 24 20 16 26 12s14 6 6 12zM32 24c8 0 12-8 6-12s-14 6-6 12z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'Ahmedabad',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" className="w-10 h-10 mx-auto stroke-[1.8]">
        <path d="M12 52h40M18 52V22l14-10 14 10v30M24 52V36h16v16M26 28a6 6 0 0 1 12 0" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'Pune',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" className="w-10 h-10 mx-auto stroke-[1.8]">
        <path d="M12 52h40M16 52V30l16-12 16 12v22M22 52V38h20v14M26 30h12" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'Chennai',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" className="w-10 h-10 mx-auto stroke-[1.8]">
        <path d="M14 52h36M20 52l6-36h12l6 36M24 40h16M26 30h12M28 20h8M32 16v-4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'Kolkata',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" className="w-10 h-10 mx-auto stroke-[1.8]">
        <path d="M10 52h44M16 52c0-14 7-24 16-24s16 10 16 24M24 52V38a8 8 0 0 1 16 0v14M32 28V14M26 18h12" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'Kochi',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" className="w-10 h-10 mx-auto stroke-[1.8]">
        <path d="M10 52h44M16 52C22 36 34 32 48 34M24 52c4-12 12-16 24-16M14 36c10 0 14-8 12-16M48 34c4-10-2-16-10-14" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const RAW_CITIES = [
  // Andhra Pradesh
  'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Kakinada', 'Tirupati', 'Anantapur', 'Kadapa',
  'Vizianagaram', 'Eluru', 'Ongole', 'Nandyal', 'Machilipatnam', 'Tenali', 'Proddatur', 'Chittoor', 'Hindupur', 'Bhimavaram',
  'Madanapalle', 'Guntakal', 'Dharmavaram', 'Gudivada', 'Narasaraopet', 'Tadepalligudem', 'Mangalagiri', 'Tadipatri',
  'Chilakaluripet', 'Adoni', 'Chirala', 'Bapatla', 'Palakollu', 'Amravati', 'Narasapur', 'Narsipatnam', 'Srikakulam',
  'Amalapuram', 'Anakapalle', 'Markapur', 'Tuni', 'Rayachoti', 'Sullurpeta', 'Tanuku', 'Addanki', 'Agiripalli', 'Akividu', 'Amalapuram',

  // Telangana
  'Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet',
  'Siddipet', 'Miryalaguda', 'Jagtial', 'Nirmal', 'Kamareddy', 'Kothagudem', 'Mancherial', 'Wanaparthy', 'Jangaon', 'Sangareddy',
  'Vikarabad', 'Zaheerabad', 'Bhongir', 'Korutla', 'Tandur', 'Achampet', 'Armoor', 'Gadwal', 'Hanamkonda',

  // Maharashtra
  'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Pimpri-Chinchwad', 'Nashik', 'Kalyan-Dombivli', 'Vasai-Virar', 'Aurangabad (Chhatrapati Sambhajinagar)',
  'Navi Mumbai', 'Solapur', 'Mira-Bhayandar', 'Bhiwandi', 'Amravati', 'Nanded', 'Kolhapur', 'Ulhasnagar', 'Sangli', 'Malegaon',
  'Jalgaon', 'Akola', 'Latur', 'Dhule', 'Ahilyanagar (Ahmednagar)', 'Chandrapur', 'Parbhani', 'Ichalkaranji', 'Jalna', 'Ambarnath',
  'Bhusawal', 'Panvel', 'Badlapur', 'Gondia', 'Satara', 'Yavatmal', 'Achalpur', 'Osmanabad (Dharashiv)', 'Nandurbar', 'Wardha',
  'Udgir', 'Hinganghat', 'Karad', 'Chiplun', 'Ratnagiri', 'Palghar', 'Alibaug', 'Baramati', 'Bhandara', 'Buldhana', 'Sawantwadi',
  'Shirdi', 'Akluj', 'Akot', 'Barshi', 'Beed', 'Chopda', 'Dahanu', 'Ichalkaranji', 'Kopergaon', 'Lonar', 'Lonavala', 'Malvan', 'Nanded',

  // Karnataka
  'Bengaluru', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi', 'Davanagere', 'Ballari', 'Vijayapura', 'Shivamogga', 'Tumakuru',
  'Raichur', 'Bidar', 'Hosapete', 'Gadag', 'Hassan', 'Kalaburagi', 'Udupi', 'Robertsonpet', 'Bhadravathi', 'Chitradurga', 'Kolar',
  'Mandya', 'Chikmagalur', 'Gangavati', 'Bagalkot', 'Ranebennur', 'Karwar', 'Sirsi', 'Gokak', 'Ramanagara', 'Chintamani', 'Koppal',
  'Yadgir', 'Chamarajanagar', 'Nipani', 'Bhatkal', 'Channapatna', 'Dharwad', 'Haveri', 'Hospet', 'Madikeri',

  // Tamil Nadu
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur', 'Erode', 'Tirunelveli', 'Vellore', 'Thoothukudi',
  'Nagercoil', 'Thanjavur', 'Dindigul', 'Kanchipuram', 'Karur', 'Cuddalore', 'Neyveli', 'Hosur', 'Ambur', 'Karaikudi', 'Pudukkottai',
  'Vaniyambadi', 'Pollachi', 'Rajapalayam', 'Gudiyatham', 'Sivakasi', 'Nagapattinam', 'Mayiladuthurai', 'Tiruvannamalai', 'Ooty',
  'Coonoor', 'Tenkasi', 'Namakkal', 'Kumbakonam', 'Arakkonam', 'Attur', 'Tindivanam', 'Virudhunagar', 'Ramanathapuram', 'Acharapakkam',
  'Alangudi', 'Alangulam', 'Annur', 'Aruppukottai', 'Chidambaram', 'Dharmapuri', 'Karaikal', 'Kattumannarkoil', 'Kovilpatti',

  // Kerala
  'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam', 'Thrissur', 'Kannur', 'Alappuzha', 'Kottayam', 'Palakkad', 'Manjeri',
  'Thalassery', 'Ponnani', 'Vatakara', 'Kanhangad', 'Payyanur', 'Malappuram', 'Kayamkulam', 'Tirur', 'Changanassery', 'Kasaragod',
  'Nedumangad', 'Attingal', 'Kothamangalam', 'Pathanamthitta', 'Muvattupuzha', 'Adoor', 'Kattappana', 'Sultan Bathery', 'Kalpetta',
  'Perinthalmanna', 'Adimali', 'Alakode', 'Alathur', 'Badgara', 'Cherthala', 'Guruvayur', 'Idukki', 'Kanjirappally', 'Karunagappally',

  // Delhi-NCR & UT
  'Delhi-NCR', 'New Delhi', 'Noida', 'Greater Noida', 'Gurugram', 'Ghaziabad', 'Faridabad', 'Bahadurgarh', 'Sonipat', 'Jhajjar', 'Rohtak', 'Palwal',

  // Gujarat
  'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Navsari', 'Morbi',
  'Nadiad', 'Surendranagar', 'Bharuch', 'Mehsana', 'Bhuj', 'Porbandar', 'Veraval', 'Valsad', 'Vapi', 'Gandhidham', 'Godhra',
  'Patan', 'Dahod', 'Botad', 'Amreli', 'Palanpur', 'Ankleshwar', 'Deesa', 'Jetpur', 'Adipur', 'Amreli', 'Bardoli', 'Dakor', 'Daman', 'Halol', 'Himatnagar', 'Idar', 'Kadi', 'Kalol', 'Kheda', 'Modasa', 'Unjha', 'Vyara',

  // Uttar Pradesh
  'Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj (Allahabad)', 'Bareilly', 'Aligarh', 'Moradabad',
  'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Budaun', 'Rampur', 'Shahjahanpur',
  'Farrukhabad', 'Ayodhya (Faizabad)', 'Hapur', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal', 'Amroha', 'Hardoi', 'Fatehpur',
  'Raebareli', 'Orai', 'Sitapur', 'Bahraich', 'Modinagar', 'Unnao', 'Jaunpur', 'Lakhimpur', 'Hathras', 'Banda', 'Pilibhit',
  'Deoria', 'Ghazipur', 'Basti', 'Azamgarh', 'Ballia', 'Akbarpur', 'Aligarh', 'Auraiya', 'Baghpat', 'Bijnor', 'Chandausi', 'Etah', 'Gonda', 'Khurja', 'Loni', 'Mainpuri', 'Shamli',

  // West Bengal
  'Kolkata', 'Asansol', 'Siliguri', 'Durgapur', 'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur', 'Shantipur', 'Dankuni',
  'Dhulian', 'Ranaghat', 'Haldia', 'Raiganj', 'Krishnanagar', 'Nabadwip', 'Midnapore', 'Jalpaiguri', 'Balurghat', 'Basirhat',
  'Bankura', 'Purulia', 'Cooch Behar', 'Darjeeling', 'Kalimpong', 'Bolpur', 'Rampurhat', 'Alipurduar', 'Bagdogra', 'Barrackpore', 'Bongaigaon', 'Contai', 'Hooghly', 'Kalyani', 'Medinipur', 'Rishra', 'Suri',

  // Punjab & Haryana
  'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali (SAS Nagar)', 'Hoshiarpur', 'Pathankot', 'Moga', 'Abohar',
  'Khanna', 'Phagwara', 'Muktsar', 'Barnala', 'Rajpura', 'Firozpur', 'Kapurthala', 'Sangrur', 'Fazilka', 'Mansa', 'Malerkotla',
  'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Jind', 'Thanesar (Kurukshetra)', 'Kaithal', 'Rewari', 'Palwal', 'Fatehabad', 'Gurdaspur', 'Jagraon', 'Kalka', 'Narnaul', 'Pehowa',

  // Rajasthan
  'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar',
  'Jhunjhunu', 'Chittorgarh', 'Kishangarh', 'Beawar', 'Hanumangarh', 'Dholpur', 'Sawai Madhopur', 'Churu', 'Gangapur', 'Jaisalmer',
  'Barmer', 'Mount Abu', 'Abu Road', 'Ahore', 'Balotra', 'Bundi', 'Dausa', 'Didwana', 'Jhalawar', 'Karauli', 'Nagaur', 'Nathdwara', 'Nokha', 'Phalodi', 'Sujangarh',

  // Madhya Pradesh
  'Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Murwara (Katni)', 'Singrauli',
  'Burhanpur', 'Khandwa', 'Bhind', 'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha', 'Chhatarpur', 'Damoh', 'Mandsaur', 'Neemuch',
  'Sehore', 'Hoshangabad (Narmadapuram)', 'Itarsi', 'Agar Malwa', 'Ashoknagar', 'Ashta', 'Balaghat', 'Barwani', 'Betul', 'Dhar', 'Harda', 'Khargone', 'Mandla', 'Nagda', 'Pithampur', 'Seoni',

  // Bihar & Jharkhand
  'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar', 'Munger',
  'Chhapra', 'Danapur', 'Bettiah', 'Saharsa', 'Sasaram', 'Hajipur', 'Dehri', 'Siwan', 'Motihari', 'Nawada', 'Buxar', 'Kishanganj',
  'Sitamarhi', 'Jehanabad', 'Araria', 'Bhabua', 'Gopalganj', 'Jamui', 'Lakhisarai', 'Madhubani', 'Samastipur',
  'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Phusro', 'Hazaribagh', 'Giridih', 'Ramgarh',
  'Medininagar (Daltonganj)', 'Chirkunda', 'Dumka', 'Chaibasa', 'Jhumri Telaiya', 'Pakur', 'Sahibganj',

  // Odisha & Chhattisgarh
  'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada', 'Jharsuguda',
  'Bargarh', 'Jeypore', 'Rayagada', 'Dhenkanal', 'Bolangir', 'Kendujhar', 'Angul', 'Jajpur', 'Kendrapara', 'Koraput',
  'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Raigarh', 'Jagdalpur', 'Ambikapur', 'Dhamtari', 'Mahasamund', 'Akaltara', 'Durg', 'Kawardha',

  // North-East, UTs & Hill States
  'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Dhubri', 'Karimganj', 'North Lakhimpur', 'Goalpara',
  'Agartala', 'Imphal', 'Shillong', 'Aizawl', 'Kohima', 'Dimapur', 'Gangtok', 'Itanagar', 'Aalo',
  'Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Nainital', 'Almora', 'Mussoorie', 'Pauri', 'Kotdwar',
  'Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Baddi', 'Kullu', 'Hamirpur', 'Una',
  'Jammu', 'Srinagar', 'Anantnag', 'Baramulla', 'Udhampur', 'Kathua', 'Leh',
  'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda',
  'Puducherry', 'Port Blair', 'Silvassa'
];

// Deduplicate and sort alphabetically
export const ALL_INDIAN_CITIES = Array.from(new Set(RAW_CITIES)).sort((a, b) =>
  a.localeCompare(b)
);

export const CityProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('cineledger_city') || 'Mumbai';
  });

  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const selectCity = (cityName) => {
    setSelectedCity(cityName);
    localStorage.setItem('cineledger_city', cityName);
    setIsCityModalOpen(false);
  };

  const openCityModal = () => setIsCityModalOpen(true);
  const closeCityModal = () => setIsCityModalOpen(false);

  return (
    <CityContext.Provider
      value={{
        selectedCity,
        selectCity,
        isCityModalOpen,
        openCityModal,
        closeCityModal,
        POPULAR_CITIES,
        ALL_INDIAN_CITIES,
      }}
    >
      {children}
    </CityContext.Provider>
  );
};

export const useCity = () => {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
};
