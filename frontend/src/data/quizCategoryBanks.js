// Curated question banks used as grounding material for the AI quiz
// generator when a student picks a ready-made category instead of
// typing a topic or pasting their own material. Sourced from teacher-
// supplied quiz decks; each entry is question/options/correctAnswer/
// explanation, never shown verbatim — buildCategoryMaterial() below
// samples a random subset and hands it to the AI as reference material,
// so the generated quiz varies each time while staying grounded in
// this content.

export const QUIZ_CATEGORIES = [
  {
    key: 'india',
    label: 'India',
    emoji: '🇮🇳',
    questions: [
      {
        "question": "Which source has the largest share of power generation in India?",
        "options": [
          "Hydro",
          "Thermal",
          "Wind"
        ],
        "correctAnswer": "Thermal",
        "explanation": "Thermal power (coal, gas and oil) accounts for 68.2% of power generated in India.",
        "image": "/quiz-decks/india/india-q1-main.jpg",
        "explainImage": "/quiz-decks/india/india-q1-explain.jpg"
      },
      {
        "question": "The pastoral community of Todas live in which Indian state?",
        "options": [
          "Rajasthan",
          "Assam",
          "Tamil Nadu"
        ],
        "correctAnswer": "Tamil Nadu",
        "explanation": "The Todas are a small pastoral community who live on the isolated Nilgiri plateau in Tamil Nadu. The Toda lands are part of the Nilgiri Biosphere Reserve, a UNESCO-designated International Biosphere Reserve.",
        "image": "/quiz-decks/india/india-q2-main.jpg",
        "explainImage": "/quiz-decks/india/india-q2-explain.jpg"
      },
      {
        "question": "Van Mahotsav, 'The Tree Festival', is associated with?",
        "options": [
          "Cutting trees",
          "Tree protection",
          "Planting trees"
        ],
        "correctAnswer": "Planting trees",
        "explanation": "Van Mahotsav, or 'Forest Festival', is an annual week-long tree-planting festival in India celebrated from July 1st to 7th to promote conservation and increase green cover.",
        "image": "/quiz-decks/india/india-q3-main.jpg",
        "explainImage": "/quiz-decks/india/india-q3-explain.jpg"
      },
      {
        "question": "Which Indian state is famous for its backwaters?",
        "options": [
          "Kerala",
          "Punjab",
          "Gujarat"
        ],
        "correctAnswer": "Kerala",
        "explanation": "The Kerala backwaters are a network of brackish lagoons and canals running parallel to the Arabian Sea along the Malabar coast of Kerala state in south-western India.",
        "image": "/quiz-decks/india/india-q4-main.jpg",
        "explainImage": "/quiz-decks/india/india-q4-explain.jpg"
      },
      {
        "question": "What is the national animal of India?",
        "options": [
          "Peacock",
          "Tiger",
          "Elephant"
        ],
        "correctAnswer": "Tiger",
        "explanation": "The Royal Bengal Tiger is the national animal of India, symbolizing power, strength, elegance, and alertness. India is home to over 75% of the global tiger population, protected under the Wildlife Protection Act.",
        "image": "/quiz-decks/india/india-q5-main.jpg",
        "explainImage": "/quiz-decks/india/india-q5-explain.jpg"
      },
      {
        "question": "Which monument is known as a 'Symbol of Love' in India?",
        "options": [
          "Red Fort",
          "Qutab Minar",
          "Taj Mahal"
        ],
        "correctAnswer": "Taj Mahal",
        "explanation": "The Taj Mahal was built by the fifth Mughal emperor, Shah Jahan, in 1631 in memory of his third and most favourite wife, Mumtaz Mahal. It is considered the greatest example of Indo-Islamic architecture.",
        "image": "/quiz-decks/india/india-q6-main.jpg",
        "explainImage": "/quiz-decks/india/india-q6-explain.jpg"
      },
      {
        "question": "In which year did India gain independence from British rule?",
        "options": [
          "1937",
          "1947",
          "1957"
        ],
        "correctAnswer": "1947",
        "explanation": "India gained independence from British colonial rule on August 15, 1947, marking the end of nearly 200 years of British administration.",
        "image": "/quiz-decks/india/india-q7-main.jpg",
        "explainImage": "/quiz-decks/india/india-q7-explain.jpg"
      },
      {
        "question": "India's largest petrochemical complex is in which state?",
        "options": [
          "West Bengal",
          "Gujarat",
          "Punjab"
        ],
        "correctAnswer": "Gujarat",
        "explanation": "India's largest petrochemical complex is located in Jamnagar, Gujarat. Operated by Reliance Industries Limited, the massive refinery is the largest in the world, contributing to Gujarat's status as the 'petro capital' of India.",
        "image": "/quiz-decks/india/india-q8-main.jpg",
        "explainImage": "/quiz-decks/india/india-q8-explain.jpg"
      },
      {
        "question": "Which water system contributes the maximum to irrigation in India?",
        "options": [
          "Surface water",
          "River water",
          "Ground water"
        ],
        "correctAnswer": "Ground water",
        "explanation": "Ground water (wells and tube wells) contributes the maximum to irrigation in India, accounting for over 60-67% of the total irrigated area.",
        "image": "/quiz-decks/india/india-q9-main.jpg",
        "explainImage": "/quiz-decks/india/india-q9-explain.jpg"
      },
      {
        "question": "Which Indian state receives the highest average annual rainfall?",
        "options": [
          "Meghalaya",
          "West Bengal",
          "Kerala"
        ],
        "correctAnswer": "Meghalaya",
        "explanation": "Mawsynram in Meghalaya, India, holds the title for the highest average annual rainfall in the world, receiving over 11,000 mm of rain annually.",
        "image": "/quiz-decks/india/india-q10-main.jpg",
        "explainImage": "/quiz-decks/india/india-q10-explain.jpg"
      },
      {
        "question": "How many official languages are there in India?",
        "options": [
          "20",
          "25",
          "22"
        ],
        "correctAnswer": "22",
        "explanation": "There are 22 official languages in India, recognized under the Eighth Schedule of the Indian Constitution, representing India's immense linguistic diversity.",
        "image": "/quiz-decks/india/india-q11-main.jpg",
        "explainImage": "/quiz-decks/india/india-q11-explain.jpg"
      },
      {
        "question": "Malayalam is predominantly spoken in which state?",
        "options": [
          "Kerala",
          "Karnataka",
          "Tamil Nadu"
        ],
        "correctAnswer": "Kerala",
        "explanation": "Malayalam is a Dravidian language spoken predominantly in the South Indian state of Kerala, serving as the official language for over 35 million people.",
        "image": "/quiz-decks/india/india-q12-main.jpg",
        "explainImage": "/quiz-decks/india/india-q12-explain.jpg"
      },
      {
        "question": "The red colour of soil is caused by which of the following?",
        "options": [
          "Magnesium compound",
          "Iron compound",
          "Aluminium compound"
        ],
        "correctAnswer": "Iron compound",
        "explanation": "Red coloured soil is primarily caused by a high concentration of iron oxides (especially hematite), particularly in warm, temperate, and humid climates.",
        "image": "/quiz-decks/india/india-q13-main.jpg",
        "explainImage": "/quiz-decks/india/india-q13-explain.jpg"
      },
      {
        "question": "The Chitrakote Falls is situated on which of the following rivers?",
        "options": [
          "Sharavati",
          "Indravati",
          "Hasdeo"
        ],
        "correctAnswer": "Indravati",
        "explanation": "Chitrakote Falls is the widest waterfall in India, reaching a width of nearly 300 metres during peak monsoon. It is located on the Indravati river in the state of Chhattisgarh.",
        "image": "/quiz-decks/india/india-q14-main.jpg",
        "explainImage": "/quiz-decks/india/india-q14-explain.jpg"
      },
      {
        "question": "The Jim Corbett National Park is located in which state?",
        "options": [
          "Uttar Pradesh",
          "Tamil Nadu",
          "Karnataka"
        ],
        "correctAnswer": "Uttar Pradesh",
        "explanation": "Jim Corbett National Park is a forested wildlife sanctuary in northern India, known for Bengal tigers. Animals including tigers, leopards and wild elephants roam the Dhikala zone.",
        "image": "/quiz-decks/india/india-q15-main.jpg",
        "explainImage": "/quiz-decks/india/india-q15-explain.jpg"
      },
      {
        "question": "The Sunderbans National Park is located in which state?",
        "options": [
          "West Bengal",
          "Kerala",
          "Uttar Pradesh"
        ],
        "correctAnswer": "West Bengal",
        "explanation": "Sundarbans National Park is in West Bengal, India, located on the Ganges Delta and adjacent to the Sundarban Reserve Forest in Bangladesh.",
        "image": "/quiz-decks/india/india-q16-main.jpg",
        "explainImage": "/quiz-decks/india/india-q16-explain.jpg"
      },
      {
        "question": "The Ranthambore National Park is located in which state?",
        "options": [
          "West Bengal",
          "Rajasthan",
          "Uttar Pradesh"
        ],
        "correctAnswer": "Rajasthan",
        "explanation": "Ranthambore National Park is a vast wildlife reserve near the town of Sawai Madhopur in Rajasthan. It is a former royal hunting ground, home to tigers, leopards and marsh crocodiles.",
        "image": "/quiz-decks/india/india-q17-main.jpg",
        "explainImage": "/quiz-decks/india/india-q17-explain.jpg"
      },
      {
        "question": "The Ajanta and Ellora caves are located in which state?",
        "options": [
          "Uttar Pradesh",
          "Maharashtra",
          "Madhya Pradesh"
        ],
        "correctAnswer": "Maharashtra",
        "explanation": "The Ajanta and Ellora caves are religious cave monuments in Maharashtra state in western India, located about 50 miles apart.",
        "image": "/quiz-decks/india/india-q18-main.jpg",
        "explainImage": "/quiz-decks/india/india-q18-explain.jpg"
      },
      {
        "question": "Which is the longest river in India?",
        "options": [
          "Ganges",
          "Narmada",
          "Godavari"
        ],
        "correctAnswer": "Ganges",
        "explanation": "The Ganges is the longest river within India, running 2,525 km from the Himalayas in Uttarakhand to the Bay of Bengal in West Bengal.",
        "image": "/quiz-decks/india/india-q19-main.jpg",
        "explainImage": "/quiz-decks/india/india-q19-explain.jpg"
      },
      {
        "question": "Who was the first Prime Minister of India?",
        "options": [
          "Sardar Vallabhbhai Patel",
          "Jawaharlal Nehru",
          "Subhas Chandra Bose"
        ],
        "correctAnswer": "Jawaharlal Nehru",
        "explanation": "Jawaharlal Nehru was a central figure in India during the middle of the 20th century, leading the Indian nationalist movement in the 1930s and 1940s before becoming the country's first Prime Minister.",
        "image": "/quiz-decks/india/india-q20-main.jpg",
        "explainImage": "/quiz-decks/india/india-q20-explain.jpg"
      },
      {
        "question": "When is Republic Day celebrated in India?",
        "options": [
          "02 October",
          "15 August",
          "26 January"
        ],
        "correctAnswer": "26 January",
        "explanation": "Republic Day is a national holiday commemorating the adoption of the Constitution of India and the country's transition to a republic, which came into effect on 26 January 1950.",
        "image": "/quiz-decks/india/india-q21-main.jpg",
        "explainImage": "/quiz-decks/india/india-q21-explain.jpg"
      },
      {
        "question": "Who is known as India's 'Father of the Nation'?",
        "options": [
          "Mahatma Gandhi",
          "Jawaharlal Nehru",
          "Rajendra Prasad"
        ],
        "correctAnswer": "Mahatma Gandhi",
        "explanation": "Mahatma Gandhi led India's independence movement through nonviolent resistance and is honoured as the 'Father of the Nation' for his role in the freedom struggle.",
        "image": "/quiz-decks/india/india-q22-main.jpg",
        "explainImage": "/quiz-decks/india/india-q22-explain.jpg"
      },
      {
        "question": "What is the national dress for men in India?",
        "options": [
          "Trouser and shirt",
          "Dhoti / Kurta pyjama",
          "3-piece suit and tie"
        ],
        "correctAnswer": "Dhoti / Kurta pyjama",
        "explanation": "India does not have one single, officially declared national dress due to its vast cultural diversity, but the kurta-pyjama is considered the traditional attire for men.",
        "image": "/quiz-decks/india/india-q23-main.jpg",
        "explainImage": "/quiz-decks/india/india-q23-explain.jpg"
      },
      {
        "question": "What is the national dress for women in India?",
        "options": [
          "Saree",
          "Salwar Kameez",
          "Dress"
        ],
        "correctAnswer": "Saree",
        "explanation": "India does not have one single, officially declared national dress due to its vast cultural diversity, but the saree is widely considered the national dress for women.",
        "image": "/quiz-decks/india/india-q24-main.jpg",
        "explainImage": "/quiz-decks/india/india-q24-explain.jpg"
      },
      {
        "question": "What was the first Indian state created based on language?",
        "options": [
          "Maharashtra",
          "West Bengal",
          "Andhra Pradesh"
        ],
        "correctAnswer": "Andhra Pradesh",
        "explanation": "Andhra State was the first Indian state created based on language, formed on October 1, 1953, from the Telugu-speaking northern districts of Madras State.",
        "image": "/quiz-decks/india/india-q25-main.jpg",
        "explainImage": "/quiz-decks/india/india-q25-explain.jpg"
      },
      {
        "question": "Which is the largest freshwater lake in India?",
        "options": [
          "Wular Lake",
          "Dal Lake",
          "Pichola Lake"
        ],
        "correctAnswer": "Wular Lake",
        "explanation": "Wular Lake, located in Jammu and Kashmir, is India's largest — and one of Asia's largest — freshwater lakes.",
        "image": "/quiz-decks/india/india-q26-main.png",
        "explainImage": "/quiz-decks/india/india-q26-explain.jpg"
      },
      {
        "question": "What is the national bird of India?",
        "options": [
          "Swan",
          "Peacock",
          "Eagle"
        ],
        "correctAnswer": "Peacock",
        "explanation": "The peacock is the national bird of India. It has a deep-rooted role in Indian traditions and mythology, representing beauty, grace, and pride.",
        "image": "/quiz-decks/india/india-q27-main.jpg",
        "explainImage": "/quiz-decks/india/india-q27-explain.jpg"
      },
      {
        "question": "What is the national fruit of India?",
        "options": [
          "Apple",
          "Banana",
          "Mango"
        ],
        "correctAnswer": "Mango",
        "explanation": "The mango is the national fruit of India, symbolizing prosperity, abundance, and wealth. Known as the 'king of fruits', India is the world's largest producer, with over 1,000 varieties.",
        "image": "/quiz-decks/india/india-q28-main.jpg",
        "explainImage": "/quiz-decks/india/india-q28-explain.jpg"
      },
      {
        "question": "Who wrote the Indian national anthem?",
        "options": [
          "Rabindranath Tagore",
          "Mahatma Gandhi",
          "Jawaharlal Nehru"
        ],
        "correctAnswer": "Rabindranath Tagore",
        "explanation": "'Jana Gana Mana', composed in Bengali by Nobel laureate Rabindranath Tagore, was adopted as India's national anthem on January 24, 1950.",
        "image": "/quiz-decks/india/india-q29-main.jpg",
        "explainImage": "/quiz-decks/india/india-q29-explain.jpg"
      },
      {
        "question": "What is the name of the large wheel in the centre of the Indian flag?",
        "options": [
          "Ashoka Chakra",
          "Vijaya Chakra",
          "Bharat Chakra"
        ],
        "correctAnswer": "Ashoka Chakra",
        "explanation": "The Ashoka Chakra, or 'wheel of duty', is a 24-spoked navy blue emblem centred on the white band of the Indian national flag, representing the Dharmachakra (wheel of law).",
        "image": "/quiz-decks/india/india-q30-main.png",
        "explainImage": "/quiz-decks/india/india-q30-explain.png"
      },
      {
        "question": "Which city is known as the 'Pink City' in India?",
        "options": [
          "Agra",
          "Jaipur",
          "Jodhpur"
        ],
        "correctAnswer": "Jaipur",
        "explanation": "Jaipur, capital of Rajasthan, is known as the 'Pink City' for the trademark colour of its old city buildings.",
        "image": "/quiz-decks/india/india-q31-main.jpg",
        "explainImage": "/quiz-decks/india/india-q31-explain.jpg"
      },
      {
        "question": "Which is the largest state in India by area?",
        "options": [
          "Rajasthan",
          "Uttar Pradesh",
          "Maharashtra"
        ],
        "correctAnswer": "Rajasthan",
        "explanation": "Rajasthan is the largest state in India by area, covering about 342,000 sq km — roughly 10.4% of the country's total land area. It is known as the 'Land of Kings'.",
        "image": "/quiz-decks/india/india-q32-main.jpg",
        "explainImage": "/quiz-decks/india/india-q32-explain.jpg"
      },
      {
        "question": "Which is India's tallest statue?",
        "options": [
          "Statue of Unity, Gujarat",
          "Statue of Belief, Rajasthan",
          "Statue of Equality, Hyderabad"
        ],
        "correctAnswer": "Statue of Unity, Gujarat",
        "explanation": "The Statue of Unity, depicting Sardar Vallabhbhai Patel, stands at 182 metres in Gujarat, making it the world's tallest statue.",
        "image": "/quiz-decks/india/india-q33-main.jpg",
        "explainImage": "/quiz-decks/india/india-q33-explain.jpg"
      },
      {
        "question": "What is the national dance of India?",
        "options": [
          "Bhangra",
          "Bharat Natyam",
          "Kathakali"
        ],
        "correctAnswer": "Bharat Natyam",
        "explanation": "Bharatnatyam is considered the national dance of India, one of the oldest and most popular classical dance forms, originating in Tamil Nadu over 2,000 years ago.",
        "image": "/quiz-decks/india/india-q34-main.jpg",
        "explainImage": "/quiz-decks/india/india-q34-explain.jpg"
      },
      {
        "question": "Where is the Karakoram mountain range located?",
        "options": [
          "North West India",
          "East Himalaya",
          "Central Himalaya"
        ],
        "correctAnswer": "North West India",
        "explanation": "The Karakoram and Himalaya are two of the world's highest mountain systems, located along the borders of Pakistan, India, China, and Afghanistan. It contains K2, the world's second highest peak.",
        "image": "/quiz-decks/india/india-q35-main.jpg",
        "explainImage": "/quiz-decks/india/india-q35-explain.jpg"
      },
      {
        "question": "Where is the Purvanchal mountain range located?",
        "options": [
          "North India",
          "Central India",
          "East India"
        ],
        "correctAnswer": "East India",
        "explanation": "The Purvanchal Range is the southward extension of the Himalayas in northeastern India, running along the India-Myanmar border.",
        "image": "/quiz-decks/india/india-q36-main.jpg",
        "explainImage": "/quiz-decks/india/india-q36-explain.jpg"
      },
      {
        "question": "Where is the Aravalli mountain range located?",
        "options": [
          "South India",
          "Northwest India",
          "Central India"
        ],
        "correctAnswer": "Northwest India",
        "explanation": "The Aravalli Range runs in a south-west direction from near Delhi, through Haryana and Rajasthan, ending in Ahmedabad, Gujarat. Its highest peak is Guru Shikhar in Mount Abu.",
        "image": "/quiz-decks/india/india-q37-main.jpg",
        "explainImage": "/quiz-decks/india/india-q37-explain.jpg"
      },
      {
        "question": "Where is the Vindhya mountain range located?",
        "options": [
          "South India",
          "East India",
          "Central India"
        ],
        "correctAnswer": "Central India",
        "explanation": "The Vindhya Range is a chain of mountain ridges and plateaus in west-central India, acting as a natural divider between Northern and Peninsular India.",
        "image": "/quiz-decks/india/india-q38-main.jpg",
        "explainImage": "/quiz-decks/india/india-q38-explain.jpg"
      },
      {
        "question": "Where is the Satpura mountain range located?",
        "options": [
          "East India",
          "Central India",
          "North India"
        ],
        "correctAnswer": "Central India",
        "explanation": "The Satpura Range is a 900-km long chain of hills in central India that runs parallel to the Vindhya Range, serving as a boundary between northern and southern India.",
        "image": "/quiz-decks/india/india-q39-main.jpg",
        "explainImage": "/quiz-decks/india/india-q39-explain.jpg"
      },
      {
        "question": "Where are the Western Ghats located?",
        "options": [
          "West coast",
          "Central India",
          "North India"
        ],
        "correctAnswer": "West coast",
        "explanation": "The Western Ghats is a 1,600 km-long mountain range running parallel to India's western coast, through Gujarat, Maharashtra, Goa, Karnataka, Kerala, and Tamil Nadu.",
        "image": "/quiz-decks/india/india-q40-main.jpg",
        "explainImage": "/quiz-decks/india/india-q40-explain.jpg"
      },
      {
        "question": "Where are the Eastern Ghats located?",
        "options": [
          "Central India",
          "East Coast",
          "North India"
        ],
        "correctAnswer": "East Coast",
        "explanation": "The Eastern Ghats are a discontinuous range of mountains running along India's eastern coast, through Odisha, Telangana, Andhra Pradesh, Karnataka, and Tamil Nadu.",
        "image": "/quiz-decks/india/india-q41-main.jpg",
        "explainImage": "/quiz-decks/india/india-q41-explain.jpg"
      },
      {
        "question": "Where are the Nilgiri Hills located?",
        "options": [
          "North India",
          "South India",
          "Central India"
        ],
        "correctAnswer": "South India",
        "explanation": "The Nilgiri Hills, or 'Blue Mountains', are a mountain range in the Western Ghats at the Tamil Nadu, Kerala, and Karnataka trijunction in South India.",
        "image": "/quiz-decks/india/india-q42-main.jpg",
        "explainImage": "/quiz-decks/india/india-q42-explain.jpg"
      },
      {
        "question": "Which city is known as the 'Silicon Valley of India'?",
        "options": [
          "Chennai",
          "Pune",
          "Bengaluru"
        ],
        "correctAnswer": "Bengaluru",
        "explanation": "Bengaluru is a major centre for information technology, consistently ranked among the world's fastest growing technology hubs, and is regarded as the 'Silicon Valley of India'.",
        "image": "/quiz-decks/india/india-q43-main.jpg",
        "explainImage": "/quiz-decks/india/india-q43-explain.jpg"
      },
      {
        "question": "Which is the largest city in India?",
        "options": [
          "Delhi",
          "Mumbai",
          "Kolkata"
        ],
        "correctAnswer": "Delhi",
        "explanation": "Delhi is the largest city in India by both population and area, serving as the national capital.",
        "image": "/quiz-decks/india/india-q44-main.jpg",
        "explainImage": "/quiz-decks/india/india-q44-explain.jpg"
      },
      {
        "question": "Which is the richest state in India?",
        "options": [
          "Maharashtra",
          "Tamil Nadu",
          "Karnataka"
        ],
        "correctAnswer": "Maharashtra",
        "explanation": "Maharashtra is the richest state in India by Gross State Domestic Product, contributing over 13% of India's total GDP, driven by major industries in Mumbai, Pune, and Nagpur.",
        "image": "/quiz-decks/india/india-q45-main.jpg",
        "explainImage": "/quiz-decks/india/india-q45-explain.jpg"
      },
      {
        "question": "Which is the poorest state in India?",
        "options": [
          "Bihar",
          "Madhya Pradesh",
          "Meghalaya"
        ],
        "correctAnswer": "Bihar",
        "explanation": "Bihar is the poorest state in India based on per capita income and multidimensional poverty, heavily dependent on agriculture and limited by low industrialization.",
        "image": "/quiz-decks/india/india-q46-main.jpg",
        "explainImage": "/quiz-decks/india/india-q46-explain.jpg"
      },
      {
        "question": "In which city is India's famous Bollywood film industry located?",
        "options": [
          "Chennai",
          "Kolkata",
          "Mumbai"
        ],
        "correctAnswer": "Mumbai",
        "explanation": "Bollywood is the massive Hindi-language film industry based in Mumbai, producing over 1,000 films annually and serving as the heart of Indian cinema.",
        "image": "/quiz-decks/india/india-q47-main.jpg",
        "explainImage": "/quiz-decks/india/india-q47-explain.jpg"
      },
      {
        "question": "Who is the world's first female amputee to climb Mount Everest?",
        "options": [
          "Rita Chawla",
          "Deepa Malik",
          "Arunima Sinha"
        ],
        "correctAnswer": "Arunima Sinha",
        "explanation": "Arunima Sinha made history on May 21, 2013, as the world's first female amputee to climb Mount Everest, after losing her leg in a 2011 train accident.",
        "image": "/quiz-decks/india/india-q48-main.jpg",
        "explainImage": "/quiz-decks/india/india-q48-explain.jpg"
      },
      {
        "question": "Who became the first woman officer to receive a Gallantry Award in the Indian Army?",
        "options": [
          "Lt. Gen. Punita Arora",
          "Major Priya Jhingan",
          "Lt. Col. Mitali Madhumita"
        ],
        "correctAnswer": "Lt. Col. Mitali Madhumita",
        "explanation": "Lt. Col. Mitali Madhumita's heroism came to light during the 2010 Kabul embassy attack, where she rushed into danger to save lives, displaying selfless and fearless bravery.",
        "image": "/quiz-decks/india/india-q49-main.jpg",
        "explainImage": "/quiz-decks/india/india-q49-explain.jpg"
      },
      {
        "question": "Who was the first Indian sportswoman to be awarded the Padma Shri?",
        "options": [
          "Bachendri Pal",
          "Arati Saha",
          "Bhakti Sharma"
        ],
        "correctAnswer": "Arati Saha",
        "explanation": "Arati Saha became the first Asian woman to swim across the English Channel in 1959, at age 19, and in 1960 became the first Indian sportswoman awarded the Padma Shri.",
        "image": "/quiz-decks/india/india-q50-main.jpg",
        "explainImage": "/quiz-decks/india/india-q50-explain.jpg"
      },
      {
        "question": "Who became the first woman president of the United Nations General Assembly?",
        "options": [
          "Sarojini Naidu",
          "Vijaya Lakshmi Pandit",
          "Aruna Asaf Ali"
        ],
        "correctAnswer": "Vijaya Lakshmi Pandit",
        "explanation": "Vijaya Lakshmi Pandit of India was elected the first woman President of the United Nations General Assembly in 1953, during its eighth session.",
        "image": "/quiz-decks/india/india-q51-main.jpg",
        "explainImage": "/quiz-decks/india/india-q51-explain.jpg"
      },
      {
        "question": "The pre-monsoon rainfall especially in Kerala, Karnataka, and parts of Tamil Nadu is called what?",
        "options": [
          "Mango Showers",
          "Lemon Showers",
          "Orange Showers"
        ],
        "correctAnswer": "Mango Showers",
        "explanation": "Mango showers are pre-monsoon rains occurring in South India from March to May, aiding the early ripening of mangoes.",
        "image": "/quiz-decks/india/india-q52-main.jpg",
        "explainImage": "/quiz-decks/india/india-q52-explain.jpg"
      },
      {
        "question": "Jog Falls in Karnataka is located on which river?",
        "options": [
          "Mandovi",
          "Sharavati",
          "Budhabalanga"
        ],
        "correctAnswer": "Sharavati",
        "explanation": "Jog Falls is a magnificent waterfall on the Sharavati river, and is the second highest plunge waterfall in India.",
        "image": "/quiz-decks/india/india-q53-main.jpg",
        "explainImage": "/quiz-decks/india/india-q53-explain.jpg"
      },
      {
        "question": "Dihang Gorge is located in which Indian state?",
        "options": [
          "Himachal Pradesh",
          "Uttar Pradesh",
          "Arunachal Pradesh"
        ],
        "correctAnswer": "Arunachal Pradesh",
        "explanation": "The Dihang Gorge lies on the border of Tibet and Arunachal Pradesh, a dramatic gorge in the Eastern Himalayas where the Brahmaputra River turns sharply south, flowing into India as the Dihang.",
        "image": "/quiz-decks/india/india-q54-main.jpg",
        "explainImage": "/quiz-decks/india/india-q54-explain.jpg"
      },
      {
        "question": "What is the national flower of India?",
        "options": [
          "Lotus",
          "Rose",
          "Lily"
        ],
        "correctAnswer": "Lotus",
        "explanation": "The lotus is India's national flower, a sacred aquatic flower symbolizing purity, beauty, divinity, and prosperity in Hinduism, Buddhism, and Jainism.",
        "image": "/quiz-decks/india/india-q55-main.jpg",
        "explainImage": "/quiz-decks/india/india-q55-explain.jpg"
      },
      {
        "question": "Which is the oldest mountain range in India?",
        "options": [
          "Satpura",
          "Vindhya",
          "Aravalli"
        ],
        "correctAnswer": "Aravalli",
        "explanation": "The Aravalli Range, running from near Delhi through Rajasthan to Gujarat, is considered the oldest mountain range in India.",
        "image": "/quiz-decks/india/india-q56-main.jpg",
        "explainImage": "/quiz-decks/india/india-q56-explain.jpg"
      },
      {
        "question": "Where is the Magnetic Hill located?",
        "options": [
          "Ladakh",
          "Western Ghats",
          "Eastern Ghats"
        ],
        "correctAnswer": "Ladakh",
        "explanation": "The Magnetic Hill is a gravity hill located in the Leh district of Ladakh, said to exert a mysterious pull on stationary vehicles — though many believe it's an optical illusion.",
        "image": "/quiz-decks/india/india-q57-main.jpg",
        "explainImage": "/quiz-decks/india/india-q57-explain.jpg"
      },
      {
        "question": "Which is the smallest state in India by area?",
        "options": [
          "Goa",
          "Tripura",
          "Sikkim"
        ],
        "correctAnswer": "Goa",
        "explanation": "Goa is the smallest state in India, with an area of about 3,702 sq km, located on the south-western coast along the Arabian Sea and known for its beaches and tourism.",
        "image": "/quiz-decks/india/india-q58-main.jpg",
        "explainImage": "/quiz-decks/india/india-q58-explain.jpg"
      },
      {
        "question": "Who is known as the 'Missile Man' of India?",
        "options": [
          "Jawahar Lal Nehru",
          "Subhas Chandra Bose",
          "A.P.J. Abdul Kalam"
        ],
        "correctAnswer": "A.P.J. Abdul Kalam",
        "explanation": "Dr. A.P.J. Abdul Kalam is renowned as the 'Missile Man of India' for his pivotal role in developing India's Agni and Prithvi missile programs, and later served as the 11th President of India.",
        "image": "/quiz-decks/india/india-q59-main.jpg",
        "explainImage": "/quiz-decks/india/india-q59-explain.jpg"
      },
      {
        "question": "Who is known as the 'Iron Man of India'?",
        "options": [
          "Jawahar Lal Nehru",
          "Sardar Vallabhbhai Patel",
          "Subhas Chandra Bose"
        ],
        "correctAnswer": "Sardar Vallabhbhai Patel",
        "explanation": "Sardar Vallabhbhai Patel was called the 'Iron Man of India' for his unwavering efforts to integrate the princely states into the Indian federation.",
        "image": "/quiz-decks/india/india-q60-main.jpg",
        "explainImage": "/quiz-decks/india/india-q60-explain.jpg"
      },
      {
        "question": "Which state is known as 'God's Own Country'?",
        "options": [
          "Punjab",
          "Maharashtra",
          "Kerala"
        ],
        "correctAnswer": "Kerala",
        "explanation": "Kerala is known as 'God's Own Country' for its lush landscapes, serene backwaters, and rich culture.",
        "image": "/quiz-decks/india/india-q61-main.jpg",
        "explainImage": "/quiz-decks/india/india-q61-explain.jpg"
      },
      {
        "question": "What is the national song of India?",
        "options": [
          "Vande Mataram",
          "Jana Gana Mana",
          "Chak De India"
        ],
        "correctAnswer": "Vande Mataram",
        "explanation": "'Vande Mataram', composed in Sanskrit by Bankim Chandra Chatterjee in the 1870s, was adopted as the national song of India on January 24, 1950, holding equal status with the national anthem.",
        "image": "/quiz-decks/india/india-q62-main.jpg",
        "explainImage": "/quiz-decks/india/india-q62-explain.jpg"
      },
      {
        "question": "Who was the first woman President of India?",
        "options": [
          "Indira Gandhi",
          "Pratibha Patil",
          "Sarojini Naidu"
        ],
        "correctAnswer": "Pratibha Patil",
        "explanation": "Pratibha Devisingh Patil was the first woman to serve as President of India, holding office as the 12th President from July 2007 to July 2012.",
        "image": "/quiz-decks/india/india-q63-main.jpg",
        "explainImage": "/quiz-decks/india/india-q63-explain.jpg"
      },
      {
        "question": "Who was India's first astronaut?",
        "options": [
          "Rakesh Sharma",
          "Ravish Malhotra",
          "Shubhanshu Shukla"
        ],
        "correctAnswer": "Rakesh Sharma",
        "explanation": "Wing Commander Rakesh Sharma is the first Indian citizen to travel to space, flying aboard Soyuz T-11 on 3 April 1984 as part of the Soviet Interkosmos programme.",
        "image": "/quiz-decks/india/india-q64-main.jpg",
        "explainImage": "/quiz-decks/india/india-q64-explain.jpg"
      },
      {
        "question": "What is the name of the highest civilian award in India?",
        "options": [
          "Vishist Seva Medal",
          "Bharat Ratna",
          "Padma Shri"
        ],
        "correctAnswer": "Bharat Ratna",
        "explanation": "The Bharat Ratna is the highest civilian award in India, instituted on January 2, 1954, awarded for exceptional service or performance of the highest order in any field.",
        "image": "/quiz-decks/india/india-q65-main.jpg",
        "explainImage": "/quiz-decks/india/india-q65-explain.jpg"
      },
      {
        "question": "Who is the richest person in India?",
        "options": [
          "Shiv Nadar",
          "Gautam Adani",
          "Mukesh Ambani"
        ],
        "correctAnswer": "Mukesh Ambani",
        "explanation": "Mukesh Ambani, chairman of Reliance Industries, is the richest person in India, controlling a massive conglomerate spanning oil, telecom, and retail.",
        "image": "/quiz-decks/india/india-q66-main.jpg",
        "explainImage": "/quiz-decks/india/india-q66-explain.jpg"
      }
    ],
  },
  {
    key: 'medical',
    label: 'Medical',
    emoji: '🩺',
    questions: [
      {
        "question": "Which Blood type is considered the universal donor?",
        "options": [
          "A",
          "O",
          "B"
        ],
        "correctAnswer": "O",
        "explanation": "O Negative blood donors are universal. There is nothing in their blood for antibodies to 'attack'. O Negative blood is safe to give to anyone, regardless of their blood type.",
        "image": "/quiz-decks/medical/medical-q1-main.png",
        "explainImage": "/quiz-decks/medical/medical-q1-explain.jpg"
      },
      {
        "question": "What is the Term for low blood sugar?",
        "options": [
          "Hypertension",
          "Hypoglycemia",
          "Hyperkalemia"
        ],
        "correctAnswer": "Hypoglycemia",
        "explanation": "Hypoglycemia is a condition in which your blood sugar (glucose) level is lower than the standard range. Glucose is the body's main source of energy.",
        "image": "/quiz-decks/medical/medical-q2-main.png",
        "explainImage": "/quiz-decks/medical/medical-q2-explain.png"
      },
      {
        "question": "Where in the Human body is the clavicle?",
        "options": [
          "Legs",
          "Shoulders",
          "Hips"
        ],
        "correctAnswer": "Shoulders",
        "explanation": "The clavicle is a bone located between the ribcage (sternum) and the shoulder blade (scapula). It connects the arm to the body.",
        "image": "/quiz-decks/medical/medical-q3-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q3-explain.jpg"
      },
      {
        "question": "Which Organ filters waste products from the blood?",
        "options": [
          "Liver",
          "Kidneys",
          "Spleen"
        ],
        "correctAnswer": "Kidneys",
        "explanation": "Kidneys filter waste products from the blood. They remove acid that is produced by the cells in the body in order to maintain a healthy balance of water, salts and minerals such as sodium, calcium, phosphorus and potassium - in the blood.",
        "image": "/quiz-decks/medical/medical-q4-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q4-explain.jpg"
      },
      {
        "question": "A Nephrologist specialises in diseases of the?",
        "options": [
          "Liver",
          "Kidneys",
          "Spleen"
        ],
        "correctAnswer": "Kidneys",
        "explanation": "A Nephrologist is a medical doctor who specializes in kidney related care and diseases.",
        "image": "/quiz-decks/medical/medical-q5-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q5-explain.jpg"
      },
      {
        "question": "A Stroke is a medical condition which affects the?",
        "options": [
          "Brain",
          "Heart",
          "Lungs"
        ],
        "correctAnswer": "Brain",
        "explanation": "A stroke occurs when the blood supply to the brain is blocked by a clot or tear in a blood vessel. There are two types of stroke: Ischemic and Hemorrhagic. Ischemic: a blood vessel becomes blocked, usually by a blood clot, depriving the brain of oxygen. Hemorrhagic: an artery ruptures, flooding the surrounding tissue with blood.",
        "image": "/quiz-decks/medical/medical-q6-main.png",
        "explainImage": "/quiz-decks/medical/medical-q6-explain.jpg"
      },
      {
        "question": "An Oncologist specialises in diseases which are?",
        "options": [
          "Cancer related",
          "Heart related",
          "Breathing related"
        ],
        "correctAnswer": "Cancer related",
        "explanation": "An Oncologist specializes in diagnosing and treating cancer. Cancer is a multifaceted illness, which is why there are several different types of oncologists.",
        "image": "/quiz-decks/medical/medical-q7-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q7-explain.jpg"
      },
      {
        "question": "A Hematologist specialises in?",
        "options": [
          "Urine infections",
          "Mental health",
          "Blood related conditions"
        ],
        "correctAnswer": "Blood related conditions",
        "explanation": "A Hematologist diagnoses, treats, and helps prevent blood-related conditions.",
        "image": "/quiz-decks/medical/medical-q8-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q8-explain.jpg"
      },
      {
        "question": "An Otolaryngologist specialises in disorders of the?",
        "options": [
          "Liver, kidney and spleen",
          "Skin",
          "Ear, nose and throat"
        ],
        "correctAnswer": "Ear, nose and throat",
        "explanation": "An Otolaryngologist specialises in diagnosing and treating diseases of the ear, nose, and throat. Also called an ENT doctor.",
        "image": "/quiz-decks/medical/medical-q9-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q9-explain.jpg"
      },
      {
        "question": "A Neonatologist specialises in the care of?",
        "options": [
          "The pancreas",
          "New born babies",
          "Appendicitis"
        ],
        "correctAnswer": "New born babies",
        "explanation": "A Neonatologist specializes in caring for and treating premature babies born with congenital disorders.",
        "image": "/quiz-decks/medical/medical-q10-main.png",
        "explainImage": "/quiz-decks/medical/medical-q10-explain.jpg"
      },
      {
        "question": "How many vital organs are there in the human body?",
        "options": [
          "4",
          "6",
          "5"
        ],
        "correctAnswer": "5",
        "explanation": "The five vital organs are the Brain, Heart, Lungs, Liver and Kidneys. Vital organs are those that a person needs to survive. A problem with any of these organs can become life threatening.",
        "image": "/quiz-decks/medical/medical-q11-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q11-explain.jpg"
      },
      {
        "question": "What is the name of the iron-containing protein in red blood cells that carries oxygen?",
        "options": [
          "Neutrophils",
          "Plasma",
          "Hemoglobin"
        ],
        "correctAnswer": "Hemoglobin",
        "explanation": "Hemoglobin is an iron-containing protein in red blood cells. It has two primary functions: transferring oxygen from the lungs to tissues throughout the body, and carrying carbon dioxide from cells back to the lungs so it can be expelled.",
        "image": "/quiz-decks/medical/medical-q12-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q12-explain.jpg"
      },
      {
        "question": "What is the rarest blood type?",
        "options": [
          "AB",
          "O",
          "A"
        ],
        "correctAnswer": "AB",
        "explanation": "AB negative is the rarest of the eight main blood types. AB negative donations are extremely versatile — plasma from AB negative donations can help treat patients of all blood types.",
        "image": "/quiz-decks/medical/medical-q13-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q13-explain.jpg"
      },
      {
        "question": "Which organ is responsible for producing insulin?",
        "options": [
          "Kidney",
          "Pancreas",
          "Liver"
        ],
        "correctAnswer": "Pancreas",
        "explanation": "The pancreas is located behind the stomach and in front of the spine. It produces insulin, enzymes and hormones. Insulin regulates blood sugar, while enzymes and hormones break down sugars, fats, and starches to aid digestion.",
        "image": "/quiz-decks/medical/medical-q14-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q14-explain.jpg"
      },
      {
        "question": "What part of the brain is responsible for memory and learning?",
        "options": [
          "Hippocampus",
          "Cerebrum",
          "Cerebellum"
        ],
        "correctAnswer": "Hippocampus",
        "explanation": "The hippocampus is located in the inner region of the temporal lobe. It is part of the limbic system, which regulates and stores emotional responses and long-term memories, and also plays an important role in spatial processing and navigation.",
        "image": "/quiz-decks/medical/medical-q15-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q15-explain.jpg"
      },
      {
        "question": "The process of converting food into energy is called?",
        "options": [
          "Homeostasis",
          "Metabolism",
          "Liposuction"
        ],
        "correctAnswer": "Metabolism",
        "explanation": "Metabolism refers to all reactions that take place throughout the body within each cell, providing the body with energy.",
        "image": "/quiz-decks/medical/medical-q16-main.png",
        "explainImage": "/quiz-decks/medical/medical-q16-explain.jpg"
      },
      {
        "question": "How many pairs of ribs does the human body typically have?",
        "options": [
          "10",
          "11",
          "12"
        ],
        "correctAnswer": "12",
        "explanation": "Humans normally have 12 pairs of ribs. The first seven pairs are attached directly to the sternum by costal cartilages and are called true ribs; the 8th, 9th and 10th pairs are false ribs, connected to the 7th rib by cartilage instead of the sternum directly.",
        "image": "/quiz-decks/medical/medical-q17-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q17-explain.jpg"
      },
      {
        "question": "Name the cell which transports electric impulses in the nervous system.",
        "options": [
          "Neuron",
          "Glia",
          "Ependymal"
        ],
        "correctAnswer": "Neuron",
        "explanation": "Neurons, or nerve cells, are units of the brain and nervous system responsible for receiving and relaying sensory electrical signals. The average human brain contains 86 billion neurons.",
        "image": "/quiz-decks/medical/medical-q18-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q18-explain.png"
      },
      {
        "question": "What is the function of the spleen in the human body?",
        "options": [
          "Digestion related",
          "Respiratory related",
          "Blood related"
        ],
        "correctAnswer": "Blood related",
        "explanation": "The spleen plays an important role in the functioning of the haemopoietic and immune systems. It is the largest filter of blood in the human body, and can also produce red and white blood cells.",
        "image": "/quiz-decks/medical/medical-q19-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q19-explain.jpg"
      },
      {
        "question": "What is the largest organ in the human body?",
        "options": [
          "Liver",
          "Brain",
          "Skin"
        ],
        "correctAnswer": "Skin",
        "explanation": "The skin is the body's largest organ. It protects against germs, regulates body temperature and enables touch (tactile) sensations.",
        "image": "/quiz-decks/medical/medical-q20-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q20-explain.jpg"
      },
      {
        "question": "What is the normal resting heart rate for adults?",
        "options": [
          "60-100 beats per minute",
          "100-140 beats per minute",
          "140-180 beats per minute"
        ],
        "correctAnswer": "60-100 beats per minute",
        "explanation": "The normal resting heart rate for adults ranges from 60 to 100 beats per minute. Generally, a lower resting heart rate implies more efficient heart function and better cardiovascular fitness.",
        "image": "/quiz-decks/medical/medical-q21-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q21-explain.jpg"
      },
      {
        "question": "Which organ produces insulin in the human body?",
        "options": [
          "Liver",
          "Pancreas",
          "Kidney"
        ],
        "correctAnswer": "Pancreas",
        "explanation": "The pancreas produces insulin, a hormone that lowers the level of glucose in the blood. Insulin is released into the blood when glucose levels rise. Diabetes occurs when the insulin does not reach its destination.",
        "image": "/quiz-decks/medical/medical-q22-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q22-explain.jpg"
      },
      {
        "question": "What is the normal body temperature in Celsius?",
        "options": [
          "32-36°C",
          "38-40°C",
          "36-38°C"
        ],
        "correctAnswer": "36-38°C",
        "explanation": "The average normal body temperature is generally accepted as 37°C. A temperature over 38°C means you have a fever. Body temperature changes throughout the day, and in adults it is lowest in the early morning.",
        "image": "/quiz-decks/medical/medical-q23-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q23-explain.jpg"
      },
      {
        "question": "What is the medical term for inflammation of the liver?",
        "options": [
          "Gastritis",
          "Hepatitis",
          "Pancreatitis"
        ],
        "correctAnswer": "Hepatitis",
        "explanation": "Hepatitis is inflammation of the liver. It can be caused by alcohol, viruses, substance use and certain diseases.",
        "image": "/quiz-decks/medical/medical-q24-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q24-explain.jpg"
      },
      {
        "question": "What is the medical term for high blood pressure?",
        "options": [
          "Hyperglycemia",
          "Hypotension",
          "Hypertension"
        ],
        "correctAnswer": "Hypertension",
        "explanation": "Normal blood pressure is 120/80 mm Hg. The first number is the systolic pressure, the force of the blood as it is pumped out of the heart; the second is the diastolic pressure, the pressure when the heart is being filled with blood.",
        "image": "/quiz-decks/medical/medical-q25-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q25-explain.jpg"
      },
      {
        "question": "What is the unit of measurement for blood pressure?",
        "options": [
          "Milligrams",
          "Millimeters of mercury (mmHg)",
          "Litres"
        ],
        "correctAnswer": "Millimeters of mercury (mmHg)",
        "explanation": "Blood pressure is measured in units of mm Hg, e.g. 120/80 mm Hg — systolic pressure over diastolic pressure.",
        "image": "/quiz-decks/medical/medical-q26-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q26-explain.jpg"
      },
      {
        "question": "What is the function of the gall bladder in the human body?",
        "options": [
          "Blood flow system",
          "Respiratory system",
          "Digestive system"
        ],
        "correctAnswer": "Digestive system",
        "explanation": "The gall bladder is a small, pear-shaped organ located in the upper right abdomen. It stores and releases bile, produced by the liver, to help the digestive system break down fats.",
        "image": "/quiz-decks/medical/medical-q27-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q27-explain.jpg"
      },
      {
        "question": "What is the full form of an MRI scan?",
        "options": [
          "Magnetic Resonance Imaging",
          "Magnetic Radiation Imaging",
          "Magnetic Radio Imaging"
        ],
        "correctAnswer": "Magnetic Resonance Imaging",
        "explanation": "An MRI (Magnetic Resonance Imaging) scan uses a magnetic field and radio waves to take pictures of the body's interior, and is used to diagnose conditions of internal organs.",
        "image": "/quiz-decks/medical/medical-q28-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q28-explain.jpg"
      },
      {
        "question": "What imaging technique is used in a CT scan?",
        "options": [
          "Magnetic Resonance",
          "Computed Tomography",
          "Both Computerised and Magnetic"
        ],
        "correctAnswer": "Computed Tomography",
        "explanation": "A CT scan (Computed Tomography) uses X-rays, while an MRI uses radio waves. Both provide images of internal organs; most doctors start with a CT scan.",
        "image": "/quiz-decks/medical/medical-q29-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q29-explain.jpg"
      },
      {
        "question": "What does a PET scan use?",
        "options": [
          "Magnetic Resonance",
          "Computed Tomography",
          "Positron Emission Tomography"
        ],
        "correctAnswer": "Positron Emission Tomography",
        "explanation": "A PET scan is an imaging test that reveals the metabolic or biochemical function of tissues and organs. Its most common use is in the detection and treatment of cancer.",
        "image": "/quiz-decks/medical/medical-q30-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q30-explain.jpg"
      },
      {
        "question": "Systolic and Diastolic are medical terms used to describe?",
        "options": [
          "Blood pressure",
          "Urine infection",
          "Vision disorder"
        ],
        "correctAnswer": "Blood pressure",
        "explanation": "Systolic and Diastolic are terms used to describe blood pressure. Normal blood pressure is 120/80 mm Hg — systolic is the force of blood pumped out of the heart, diastolic is the pressure while the heart refills.",
        "image": "/quiz-decks/medical/medical-q31-main.png",
        "explainImage": "/quiz-decks/medical/medical-q31-explain.jpg"
      },
      {
        "question": "Ischaemia is a medical term used to describe?",
        "options": [
          "Muscle inflammation",
          "Deficient blood supply",
          "Kidney disorder"
        ],
        "correctAnswer": "Deficient blood supply",
        "explanation": "Ischaemia is a restriction in blood supply to any tissue, muscle group, or organ of the body, causing a shortage of oxygen.",
        "image": "/quiz-decks/medical/medical-q32-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q32-explain.jpg"
      },
      {
        "question": "Neural is a medical term associated with the?",
        "options": [
          "Respiratory system",
          "Digestive system",
          "Nervous system"
        ],
        "correctAnswer": "Nervous system",
        "explanation": "Neural is a term relating to, or affecting, a nerve or the nervous system.",
        "image": "/quiz-decks/medical/medical-q33-main.png",
        "explainImage": "/quiz-decks/medical/medical-q33-explain.png"
      },
      {
        "question": "Which part of the brain controls balance and coordination?",
        "options": [
          "Cerebellum",
          "Cerebrum",
          "Medulla Oblongata"
        ],
        "correctAnswer": "Cerebellum",
        "explanation": "The cerebellum is primarily responsible for muscle control, including balance and movement. It also plays a role in other cognitive functions such as language processing and memory.",
        "image": "/quiz-decks/medical/medical-q34-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q34-explain.jpg"
      },
      {
        "question": "What is the primary function of the respiratory system?",
        "options": [
          "Pump blood throughout the body",
          "Produce and release hormones",
          "Exchange oxygen and carbon dioxide"
        ],
        "correctAnswer": "Exchange oxygen and carbon dioxide",
        "explanation": "The lungs and respiratory system allow us to breathe, bringing oxygen in (inhalation) and sending carbon dioxide out (exhalation). This exchange is called respiration.",
        "image": "/quiz-decks/medical/medical-q35-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q35-explain.jpg"
      },
      {
        "question": "What is the medical term for the voice box?",
        "options": [
          "Trachea",
          "Larynx",
          "Pharynx"
        ],
        "correctAnswer": "Larynx",
        "explanation": "The larynx, also called the voice box, is the area of the throat containing the vocal cords, used for breathing, swallowing and talking.",
        "image": "/quiz-decks/medical/medical-q36-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q36-explain.jpg"
      },
      {
        "question": "An abnormal heart sound caused by back flow of blood is called a?",
        "options": [
          "Bing",
          "Blip",
          "Murmur"
        ],
        "correctAnswer": "Murmur",
        "explanation": "A heart murmur is an extra whooshing or swishing sound heard during a heartbeat, caused by turbulent blood flow, often through heart valves. Most murmurs are harmless, especially in children, and don't need treatment.",
        "image": "/quiz-decks/medical/medical-q37-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q37-explain.jpg"
      },
      {
        "question": "Hepatitis is inflammation of what organ?",
        "options": [
          "Heart",
          "Liver",
          "Kidney"
        ],
        "correctAnswer": "Liver",
        "explanation": "Hepatitis is inflammation of the liver, a vital organ that processes nutrients, filters blood, and fights infections. It's often caused by viruses (A, B, C, D, E) or factors like heavy alcohol use, toxins, medications, or autoimmune issues.",
        "image": "/quiz-decks/medical/medical-q38-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q38-explain.jpg"
      },
      {
        "question": "What part of the human body is the 'oxter'?",
        "options": [
          "The neck",
          "The spine",
          "The armpit"
        ],
        "correctAnswer": "The armpit",
        "explanation": "An oxter is a regional term, mostly used in Scotland, Ireland, and Northern England, for the armpit (axilla) — the hollow area where the arm joins the shoulder.",
        "image": "/quiz-decks/medical/medical-q39-main.png",
        "explainImage": "/quiz-decks/medical/medical-q39-explain.jpg"
      },
      {
        "question": "What is a hormone?",
        "options": [
          "A stem cell",
          "A chemical messenger",
          "An electrical pulse"
        ],
        "correctAnswer": "A chemical messenger",
        "explanation": "Hormones are chemical messengers produced by glands in the endocrine system that travel through the bloodstream to signal organs, tissues, and cells, regulating vital functions like growth, metabolism, mood, and reproduction.",
        "image": "/quiz-decks/medical/medical-q40-main.png",
        "explainImage": "/quiz-decks/medical/medical-q40-explain.jpg"
      },
      {
        "question": "In the field of medicine and science, what does REM stand for?",
        "options": [
          "Rapid Eye Movement",
          "Radioactive Energy in Motion",
          "Rapid Energy Motion"
        ],
        "correctAnswer": "Rapid Eye Movement",
        "explanation": "Rapid Eye Movement (REM) refers to a stage of sleep where the brain is highly active, dreams are vivid, eyes dart around quickly under closed lids, and muscles become temporarily paralyzed — playing key roles in memory, learning, and emotional regulation.",
        "image": "/quiz-decks/medical/medical-q41-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q41-explain.jpg"
      },
      {
        "question": "What is the SA node?",
        "options": [
          "A brain pulse",
          "A breathing regulator",
          "The heart's pacemaker"
        ],
        "correctAnswer": "The heart's pacemaker",
        "explanation": "The main function of the SA node is to act as the heart's normal pacemaker, initiating an electrical impulse that travels through the heart's conduction system to cause the heart muscle to contract.",
        "image": "/quiz-decks/medical/medical-q42-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q42-explain.jpg"
      },
      {
        "question": "Name the oath taken by doctors.",
        "options": [
          "Patient Welfare Oath",
          "Hippocratic Oath",
          "Good Ethics Oath"
        ],
        "correctAnswer": "Hippocratic Oath",
        "explanation": "The Hippocratic Oath states the professional conduct and obligations of doctors, emphasizing ethical and professional standards in medicine. Its name derives from the Greek physician Hippocrates, regarded as the 'father of western medicine'.",
        "image": "/quiz-decks/medical/medical-q43-main.jpg",
        "explainImage": "/quiz-decks/medical/medical-q43-explain.jpg"
      }
    ],
  },
];

// Fisher-Yates shuffle, then take the first n — a fresh random sample
// of the category bank every time it is called.
function sample(arr, n) {
  const pool = [...arr];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(n, pool.length));
}

// Build the reference material text handed to the AI quiz generator
// for a category. A random subset (not the whole bank) is sampled
// each call, so repeated attempts at the same category produce
// different quizzes while staying grounded in the source content.
export function buildCategoryMaterial(category, count = 25) {
  const picked = sample(category.questions, count);

  return picked
    .map(
      (q, idx) =>
        `${idx + 1}. ${q.question}
Options: ${q.options.join(' | ')}
Correct answer: ${q.correctAnswer}
Why: ${q.explanation}`
    )
    .join('\n\n');
}

// Build a ready-to-play quiz straight from the category bank — the
// exact questions, options, and explanations from the source PDF, no
// AI rewriting involved. A random subset is sampled each call, so
// repeated attempts surface a different slice of the bank. Shaped to
// match the app's normal quiz-question format ({ q, options, correct,
// explanation }) so it can be dropped straight into quiz-taking state.
//
// Each bank entry also carries the real photo/graphic lifted straight
// from the source PDF (`image` / `explainImage`) — carried through here
// so the quiz player can show that instead of asking the AI to invent
// an illustration, which tends to render distorted or nonsensical
// pictures for specific factual questions like this.
export function buildCategoryQuiz(category, count = 10) {
  const picked = sample(category.questions, count);

  return {
    title: `${category.label} Quiz`,
    questions: picked.map((q) => ({
      q: q.question,
      options: [...q.options],
      correct: q.options.indexOf(q.correctAnswer),
      explanation: q.explanation,
      curatedImage: q.image || null,
      curatedExplainImage: q.explainImage || null,
    })),
  };
}
