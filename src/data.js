/*
 * Dictionnaires multilingues utilisés par le moteur de reconnaissance d'entités nommées.
 * Toutes les comparaisons se font en minuscules et sans accents (sauf `connectors`,
 * `connectorsInCue` et `placePreps`, comparés en minuscules AVEC accents).
 * Vous pouvez enrichir librement ces listes.
 */
(function (g) {
  'use strict';
  g.NERX_DATA = {
    /* ---------------- Prénoms courants (multilingue) ---------------- */
    firstNames: (
      // Français / Québec
      'Jean Pierre Paul Jacques Louis Marie Anne Michel André Philippe Alain Bernard François Françoise Claude Daniel Nicolas ' +
      'Christophe Christian Patrick Éric Eric Frédéric Laurent Stéphane Sébastien Olivier Julien Mathieu Guillaume Antoine Thomas ' +
      'Alexandre Vincent Maxime Gabriel Raphaël Hugo Lucas Léo Louise Emma Jade Chloé Léa Manon Camille Sarah Julie Isabelle ' +
      'Catherine Nathalie Sylvie Martine Christine Valérie Sophie Céline Sandrine Véronique Caroline Hélène Geneviève Josée Johanne ' +
      'Chantal Diane Lise Lucie Ginette Monique Nicole Danielle Suzanne Jacqueline Simone Madeleine Marguerite Jeanne Thérèse Colette ' +
      'Denise Yvonne Gisèle Odette Juliette Charlotte Victoire Agathe Inès Margaux Clémence Élise Elise Mélanie Émilie Emilie Audrey ' +
      'Marc Luc Yves René Henri Georges Gilles Gérard Roger Robert Raymond Marcel Maurice Lucien Émile Emile Gaston Fernand Édouard ' +
      'Edouard Étienne Etienne Benoît Benoit Denis Serge Réjean Gaétan Sylvain Mario Normand Ghislain Jocelyn Yannick Félix Felix ' +
      'Samuel Simon Victor Arthur Jules Théo Nathan Noah Liam Adam Mathis Baptiste Clément Damien Fabrice Gauthier Hervé Jérôme ' +
      'Jeremie Jérémie Kevin Loïc Lionel Ludovic Pascal Rémi Thierry Xavier Yann Ariane Annie Béatrice Brigitte Carole Corinne ' +
      'Delphine Dominique Évelyne Florence Gabrielle Ghislaine Huguette Jocelyne Karine Laurence Line Lyne Marianne Maryse Micheline ' +
      'Mireille Murielle Noémie Pauline Rachel Renée Roxanne Solange Stéphanie Virginie Wilfrid Honoré Gustave Voltaire Molière ' +
      // Anglais
      'John James William Charles George Henry Edward Richard Michael David Joseph Thomas Christopher Matthew Andrew Mark Steven ' +
      'Kenneth Brian Kevin Timothy Jason Jeffrey Ryan Gary Larry Frank Scott Eric Stephen Jonathan Benjamin Justin Brandon Gregory ' +
      'Harold Walter Patrick Peter Douglas Dennis Tyler Aaron Jose Adam Nathan Zachary Kyle Noah Ethan Jacob Logan Mason Elijah ' +
      'Oliver Jack Harry Alfred Arnold Albert Isaac Abraham Winston Franklin Theodore Barack Donald Ronald Hillary Elizabeth Mary ' +
      'Patricia Jennifer Linda Barbara Susan Jessica Margaret Sarah Karen Nancy Lisa Betty Sandra Ashley Kimberly Emily Donna ' +
      'Michelle Carol Amanda Melissa Deborah Stephanie Rebecca Sharon Laura Cynthia Kathleen Amy Shirley Angela Helen Anna Brenda ' +
      'Pamela Nicole Samantha Katherine Christine Debra Rachel Carolyn Janet Virginia Maria Heather Diane Julie Joyce Victoria ' +
      'Kelly Christina Lauren Joan Evelyn Olivia Judith Megan Cheryl Martha Andrea Frances Hannah Jacqueline Ann Gloria Jean ' +
      'Kathryn Alice Teresa Sara Janice Doris Madison Julia Grace Judy Abigail Marie Denise Beverly Amber Theresa Marilyn Danielle ' +
      'Diana Natalie Sophia Alexis Lori Kayla Jane Ava Isabella Mia Charlotte Amelia Harper Ella Scarlett Aria Chloe Zoe Lily Jane ' +
      'Virginia Ernest Ezra Agatha Toni Ella Billie Leonard Stanley Bob Bill Tom Tim Jim Joe Ben Sam Max Alex Tony Nick Mike Dave ' +
      'Steve Chris Matt Dan Sue Liz Kate Meg ' +
      // Allemand / néerlandais / nordique
      'Johann Johannes Wolfgang Ludwig Friedrich Karl Heinrich Hans Hermann Wilhelm Otto Gustav Ernst Walter Werner Klaus Jürgen ' +
      'Dieter Günter Helmut Horst Uwe Stefan Andreas Matthias Markus Tobias Jan Lukas Felix Maximilian Angela Ursula Gertrud ' +
      'Hildegard Ingrid Helga Brigitte Sabine Petra Monika Renate Claudia Katrin Anke Heike Annika Greta Lena Frieda Clara Rosa ' +
      'Hannah Sophie Vincent Rembrandt Pieter Willem Hendrik Joost Sven Lars Nils Erik Olaf Bjorn Björn Astrid Ingmar Søren Soren ' +
      'Henrik Kristian Magnus Leif Sigrid Karin Elsa Freya Ole Knut Edvard ' +
      // Espagnol / portugais / italien
      'José Jose Juan Carlos Luis Miguel Antonio Manuel Francisco Javier Rafael Fernando Pablo Diego Alejandro Sergio Jorge Alberto ' +
      'Ricardo Eduardo Roberto Enrique Ramón Ramon Gabriel Andrés Andres Emilio Salvador Federico Gonzalo Joaquín Joaquin Ignacio ' +
      'Santiago Mateo Lucía Lucia Carmen Isabel Dolores Pilar Teresa Rosa Ana Laura Marta Elena Cristina Beatriz Raquel Silvia ' +
      'Paula Sofía Sofia Valentina Gabriela Frida Rigoberta Gabriela Octavio Jorge Mario Gabriel João Joao Paulo Pedro Tiago ' +
      'Rui Vasco Fernão Luís Inês Beatriz Mariana Leonor Giuseppe Giovanni Francesco Antonio Mario Luigi Marco Alessandro Andrea ' +
      'Matteo Lorenzo Leonardo Luca Paolo Pietro Roberto Stefano Umberto Dante Galileo Michelangelo Raffaello Sandro Amedeo ' +
      'Giulia Chiara Francesca Sara Alessandra Federica Valentina Elisa Martina Giorgia Silvia Lucrezia Caterina Beatrice Maria ' +
      // Slave, grec, autres
      'Vladimir Ivan Dmitri Dmitry Sergei Sergey Alexei Alexey Mikhail Nikolai Nikolay Pavel Boris Yuri Fyodor Lev Anton Leo Igor ' +
      'Oleg Andrei Andrey Viktor Natalia Natalya Olga Tatiana Svetlana Irina Anastasia Ekaterina Yekaterina Marina Galina Ludmila ' +
      'Wojciech Krzysztof Piotr Tomasz Lech Andrzej Marie Václav Vaclav Milan Franz Bohumil Karel Jaroslav Zdeněk Ivo Ante Nikola ' +
      'Dimitris Georgios Konstantinos Nikos Yannis Giannis Eleni Maria Sofia Katerina Aristote ' +
      // Arabe, turc, persan, Asie, Afrique
      'Mohammed Muhammad Mohamed Mohammad Ahmed Ahmad Ali Hassan Hussein Omar Youssef Yusuf Ibrahim Khalid Karim Mustafa Mahmoud ' +
      'Abdel Abdul Abdullah Rachid Rashid Samir Nabil Tarek Walid Fatima Aisha Aïcha Khadija Leila Layla Nour Yasmine Yasmin ' +
      'Amina Salma Mehmet Ahmet Emre Orhan Elif Zeynep Reza Hossein Mahsa Shirin Dariush Hiroshi Takeshi Kenji Haruki Yoko Yuki ' +
      'Akira Naoki Satoshi Kazuo Yukio Hayao Wei Li Ming Jing Xiao Hui Jun Yan Mei Lin Hong Kim Min Ji Seo Hyun Jae Rabindranath ' +
      'Mahatma Narendra Indira Rahul Priya Amit Anil Sunil Raj Ravi Arjun Aditya Ananya Kofi Kwame Nelson Desmond Wangari Chinua ' +
      'Wole Ngozi Chimamanda Fela Thabo Jacob Cyril Ousmane Léopold Leopold Aimé Aime Frantz Dany Kim Haruki Gao Mo Yo'
    ).split(/\s+/).filter(Boolean),

    /* ---------------- Lieux (pays, villes, régions) ---------------- */
    places: [
      // Continents, régions
      'Afrique', 'Africa', 'Amérique', 'America', 'Americas', 'Amériques', 'Amérique du Nord', 'North America', 'Amérique du Sud', 'South America',
      'Amérique latine', 'Latin America', 'Asie', 'Asia', 'Europe', 'Océanie', 'Oceania', 'Antarctique', 'Antarctica', 'Arctique', 'Arctic',
      'Moyen-Orient', 'Middle East', 'Proche-Orient', 'Maghreb', 'Scandinavie', 'Scandinavia', 'Balkans', 'Caraïbes', 'Caribbean', 'Sahara',
      'Méditerranée', 'Mediterranean', 'Atlantique', 'Atlantic', 'Pacifique', 'Pacific', 'Europa', 'Asien', 'Afrika', 'Amerika',
      // Pays (FR / EN / ES / DE / IT / PT)
      'Canada', 'Québec', 'Quebec', 'États-Unis', 'Etats-Unis', 'United States', 'USA', 'U.S.', 'U.S.A.', 'US', 'Estados Unidos', 'Vereinigte Staaten',
      'Mexique', 'Mexico', 'México', 'Mexiko', 'Messico', 'France', 'Frankreich', 'Francia', 'França', 'Allemagne', 'Germany', 'Deutschland', 'Alemania',
      'Germania', 'Alemanha', 'Royaume-Uni', 'United Kingdom', 'UK', 'U.K.', 'Reino Unido', 'Großbritannien', 'Grande-Bretagne', 'Great Britain',
      'Angleterre', 'England', 'Inglaterra', 'Inghilterra', 'Écosse', 'Scotland', 'Pays de Galles', 'Wales', 'Irlande', 'Ireland', 'Irland', 'Irlanda',
      'Espagne', 'Spain', 'España', 'Spanien', 'Spagna', 'Espanha', 'Portugal', 'Italie', 'Italy', 'Italia', 'Italien', 'Itália', 'Suisse', 'Switzerland',
      'Schweiz', 'Suiza', 'Svizzera', 'Belgique', 'Belgium', 'Belgien', 'Bélgica', 'Belgio', 'Pays-Bas', 'Netherlands', 'Niederlande', 'Países Bajos',
      'Hollande', 'Holland', 'Luxembourg', 'Luxemburg', 'Autriche', 'Austria', 'Österreich', 'Pologne', 'Poland', 'Polen', 'Polonia', 'Tchéquie',
      'Czechia', 'Czech Republic', 'République tchèque', 'Slovaquie', 'Slovakia', 'Hongrie', 'Hungary', 'Ungarn', 'Hungría', 'Roumanie', 'Romania',
      'Rumänien', 'Bulgarie', 'Bulgaria', 'Grèce', 'Greece', 'Griechenland', 'Grecia', 'Turquie', 'Turkey', 'Türkiye', 'Türkei', 'Turquía', 'Russie',
      'Russia', 'Russland', 'Rusia', 'Ukraine', 'Ucrania', 'Biélorussie', 'Belarus', 'Suède', 'Sweden', 'Schweden', 'Suecia', 'Norvège', 'Norway',
      'Norwegen', 'Noruega', 'Danemark', 'Denmark', 'Dänemark', 'Dinamarca', 'Finlande', 'Finland', 'Finnland', 'Islande', 'Iceland', 'Island',
      'Estonie', 'Estonia', 'Lettonie', 'Latvia', 'Lituanie', 'Lithuania', 'Serbie', 'Serbia', 'Croatie', 'Croatia', 'Slovénie', 'Slovenia', 'Bosnie',
      'Bosnia', 'Albanie', 'Albania', 'Macédoine', 'Macedonia', 'Monténégro', 'Montenegro', 'Moldavie', 'Moldova', 'Chypre', 'Cyprus', 'Malte', 'Malta',
      'Monaco', 'Andorre', 'Andorra', 'Vatican', 'Saint-Marin', 'San Marino', 'Liechtenstein', 'Géorgie', 'Georgia', 'Arménie', 'Armenia',
      'Azerbaïdjan', 'Azerbaijan', 'Kazakhstan', 'Ouzbékistan', 'Uzbekistan', 'Chine', 'China', 'Japon', 'Japan', 'Japón', 'Giappone', 'Corée',
      'Korea', 'Corée du Sud', 'South Korea', 'Corée du Nord', 'North Korea', 'Inde', 'India', 'Indien', 'Pakistan', 'Bangladesh', 'Sri Lanka',
      'Népal', 'Nepal', 'Afghanistan', 'Iran', 'Irak', 'Iraq', 'Syrie', 'Syria', 'Liban', 'Lebanon', 'Israël', 'Israel', 'Palestine', 'Jordanie',
      'Jordan', 'Arabie saoudite', 'Saudi Arabia', 'Yémen', 'Yemen', 'Oman', 'Émirats arabes unis', 'United Arab Emirates', 'Qatar', 'Koweït', 'Kuwait',
      'Égypte', 'Egypt', 'Ägypten', 'Egipto', 'Libye', 'Libya', 'Tunisie', 'Tunisia', 'Algérie', 'Algeria', 'Maroc', 'Morocco', 'Marokko', 'Marruecos',
      'Mauritanie', 'Mauritania', 'Sénégal', 'Senegal', 'Mali', 'Niger', 'Nigeria', 'Ghana', "Côte d'Ivoire", 'Ivory Coast', 'Burkina Faso', 'Guinée',
      'Guinea', 'Cameroun', 'Cameroon', 'Gabon', 'Congo', 'RDC', 'Tchad', 'Chad', 'Soudan', 'Sudan', 'Éthiopie', 'Ethiopia', 'Somalie', 'Somalia',
      'Kenya', 'Ouganda', 'Uganda', 'Tanzanie', 'Tanzania', 'Rwanda', 'Burundi', 'Angola', 'Zambie', 'Zambia', 'Zimbabwe', 'Mozambique', 'Madagascar',
      'Afrique du Sud', 'South Africa', 'Südafrika', 'Sudáfrica', 'Namibie', 'Namibia', 'Botswana', 'Bénin', 'Benin', 'Togo', 'Haïti', 'Haiti', 'Cuba',
      'Jamaïque', 'Jamaica', 'République dominicaine', 'Dominican Republic', 'Porto Rico', 'Puerto Rico', 'Guatemala', 'Honduras', 'Salvador',
      'El Salvador', 'Nicaragua', 'Costa Rica', 'Panama', 'Panamá', 'Colombie', 'Colombia', 'Kolumbien', 'Venezuela', 'Équateur', 'Ecuador', 'Pérou',
      'Peru', 'Perú', 'Bolivie', 'Bolivia', 'Chili', 'Chile', 'Argentine', 'Argentina', 'Argentinien', 'Uruguay', 'Paraguay', 'Brésil', 'Brazil',
      'Brasil', 'Brasilien', 'Brasile', 'Guyane', 'Guyana', 'Suriname', 'Australie', 'Australia', 'Australien', 'Nouvelle-Zélande', 'New Zealand',
      'Indonésie', 'Indonesia', 'Malaisie', 'Malaysia', 'Singapour', 'Singapore', 'Thaïlande', 'Thailand', 'Vietnam', 'Viêt Nam', 'Cambodge',
      'Cambodia', 'Laos', 'Birmanie', 'Myanmar', 'Philippines', 'Taïwan', 'Taiwan', 'Mongolie', 'Mongolia', 'Groenland', 'Greenland',
      // Provinces, États, régions
      'Ontario', 'Alberta', 'Colombie-Britannique', 'British Columbia', 'Manitoba', 'Saskatchewan', 'Nouvelle-Écosse', 'Nova Scotia',
      'Nouveau-Brunswick', 'New Brunswick', 'Terre-Neuve', 'Newfoundland', 'Terre-Neuve-et-Labrador', 'Labrador', 'Île-du-Prince-Édouard',
      'Prince Edward Island', 'Yukon', 'Nunavut', 'Territoires du Nord-Ouest', 'Northwest Territories', 'Acadie', 'Gaspésie', 'Abitibi', 'Mauricie',
      'Estrie', 'Outaouais', 'Laurentides', 'Lanaudière', 'Montérégie', 'Charlevoix', 'Saguenay', 'Lac-Saint-Jean', 'Bas-Saint-Laurent', 'Côte-Nord',
      'Nunavik', 'Californie', 'California', 'Texas', 'Floride', 'Florida', 'New York', 'Massachusetts', 'Pennsylvanie', 'Pennsylvania', 'Illinois',
      'Ohio', 'Michigan', 'Washington', 'Oregon', 'Nevada', 'Arizona', 'Colorado', 'Utah', 'Louisiane', 'Louisiana', 'Virginie', 'Virginia', 'Vermont',
      'Maine', 'New Hampshire', 'New Jersey', 'Connecticut', 'Alaska', 'Hawaï', 'Hawaii', 'Géorgie', 'Caroline du Nord', 'North Carolina', 'Minnesota',
      'Wisconsin', 'Bretagne', 'Normandie', 'Provence', 'Alsace', 'Bourgogne', 'Occitanie', 'Corse', 'Île-de-France', 'Wallonie', 'Flandre', 'Bavière',
      'Bayern', 'Bavaria', 'Catalogne', 'Catalonia', 'Cataluña', 'Catalunya', 'Andalousie', 'Andalucía', 'Toscane', 'Tuscany', 'Toscana', 'Sicile',
      'Sicily', 'Sicilia', 'Sardaigne', 'Sardinia', 'Lombardie', 'Lombardia', 'Sibérie', 'Siberia', 'Tibet', 'Kurdistan', 'Cachemire', 'Kashmir',
      'Patagonie', 'Patagonia', 'Amazonie', 'Amazon', 'Amazonia', 'Riviera', 'Côte d\'Azur', 'Silicon Valley',
      // Villes
      'Montréal', 'Montreal', 'Laval', 'Longueuil', 'Gatineau', 'Sherbrooke', 'Trois-Rivières', 'Saguenay', 'Chicoutimi', 'Lévis', 'Rimouski',
      'Rouyn-Noranda', 'Drummondville', 'Granby', 'Saint-Jérôme', 'Terrebonne', 'Repentigny', 'Brossard', 'Blainville', 'Joliette', 'Victoriaville',
      'Shawinigan', 'Sept-Îles', 'Gaspé', 'Baie-Comeau', 'Val-d\'Or', 'Ottawa', 'Toronto', 'Vancouver', 'Calgary', 'Edmonton', 'Winnipeg', 'Halifax',
      'Regina', 'Saskatoon', 'Victoria', 'Moncton', 'Fredericton', 'Charlottetown', 'Iqaluit', 'Whitehorse', 'Yellowknife', 'Kingston', 'Hamilton',
      'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Grenoble',
      'Dijon', 'Angers', 'Avignon', 'Versailles', 'Rouen', 'Caen', 'Brest', 'Bruxelles', 'Brussels', 'Brüssel', 'Anvers', 'Antwerp', 'Gand', 'Ghent',
      'Liège', 'Genève', 'Geneva', 'Genf', 'Lausanne', 'Zurich', 'Zürich', 'Berne', 'Bern', 'Bâle', 'Basel', 'Londres', 'London', 'Manchester',
      'Liverpool', 'Birmingham', 'Edinburgh', 'Édimbourg', 'Glasgow', 'Oxford', 'Cambridge', 'Dublin', 'Berlin', 'Munich', 'München', 'Hamburg',
      'Hambourg', 'Frankfurt', 'Francfort', 'Köln', 'Cologne', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dresden', 'Dresde', 'Weimar', 'Bonn', 'Vienne',
      'Vienna', 'Wien', 'Salzburg', 'Salzbourg', 'Prague', 'Praha', 'Prag', 'Budapest', 'Varsovie', 'Warsaw', 'Warszawa', 'Cracovie', 'Kraków',
      'Krakow', 'Bucarest', 'Bucharest', 'Sofia', 'Athènes', 'Athens', 'Athen', 'Atenas', 'Istanbul', 'Constantinople', 'Ankara', 'Moscou', 'Moscow',
      'Moskau', 'Moscú', 'Saint-Pétersbourg', 'Saint Petersburg', 'Kiev', 'Kyiv', 'Kyïv', 'Minsk', 'Stockholm', 'Oslo', 'Copenhague', 'Copenhagen',
      'Helsinki', 'Reykjavik', 'Amsterdam', 'Rotterdam', 'La Haye', 'The Hague', 'Den Haag', 'Madrid', 'Barcelone', 'Barcelona', 'Séville', 'Sevilla',
      'Seville', 'Valence', 'Valencia', 'Bilbao', 'Grenade', 'Granada', 'Lisbonne', 'Lisbon', 'Lisboa', 'Porto', 'Rome', 'Roma', 'Rom', 'Milan',
      'Milano', 'Mailand', 'Naples', 'Napoli', 'Florence', 'Firenze', 'Venise', 'Venice', 'Venezia', 'Venedig', 'Turin', 'Torino', 'Bologne', 'Bologna',
      'Gênes', 'Genova', 'Palerme', 'Palermo', 'Pise', 'Pisa', 'Sienne', 'Siena', 'Vérone', 'Verona', 'New York City', 'Los Angeles', 'Chicago',
      'Houston', 'Philadelphie', 'Philadelphia', 'Boston', 'San Francisco', 'Seattle', 'Miami', 'Atlanta', 'Dallas', 'Denver', 'Detroit', 'Baltimore',
      'Nouvelle-Orléans', 'New Orleans', 'La Nouvelle-Orléans', 'Las Vegas', 'Phoenix', 'Portland', 'San Diego', 'Brooklyn', 'Manhattan', 'Harlem',
      'Hollywood', 'Princeton', 'Berkeley', 'Pittsburgh', 'Cleveland', 'Minneapolis', 'Nashville', 'Memphis', 'Mexico City', 'Ciudad de México',
      'Guadalajara', 'La Havane', 'Havana', 'La Habana', 'Port-au-Prince', 'Bogota', 'Bogotá', 'Lima', 'Quito', 'Caracas', 'Santiago', 'Buenos Aires',
      'Montevideo', 'São Paulo', 'Sao Paulo', 'Rio de Janeiro', 'Rio', 'Brasilia', 'Brasília', 'La Paz', 'Pékin', 'Beijing', 'Peking', 'Shanghai',
      'Hong Kong', 'Canton', 'Guangzhou', 'Shenzhen', 'Tokyo', 'Tokio', 'Kyoto', 'Osaka', 'Hiroshima', 'Nagasaki', 'Séoul', 'Seoul', 'Pyongyang',
      'Taipei', 'Bangkok', 'Hanoï', 'Hanoi', 'Hô Chi Minh-Ville', 'Ho Chi Minh City', 'Saïgon', 'Saigon', 'Manille', 'Manila', 'Jakarta', 'Kuala Lumpur',
      'Delhi', 'New Delhi', 'New-Delhi', 'Mumbai', 'Bombay', 'Calcutta', 'Kolkata', 'Bangalore', 'Chennai', 'Karachi', 'Lahore', 'Islamabad', 'Kaboul',
      'Kabul', 'Téhéran', 'Tehran', 'Bagdad', 'Baghdad', 'Damas', 'Damascus', 'Beyrouth', 'Beirut', 'Jérusalem', 'Jerusalem', 'Tel Aviv', 'Gaza',
      'Amman', 'Riyad', 'Riyadh', 'La Mecque', 'Mecca', 'Dubaï', 'Dubai', 'Doha', 'Le Caire', 'Cairo', 'Kairo', 'Alexandrie', 'Alexandria', 'Tunis',
      'Alger', 'Algiers', 'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Fez', 'Dakar', 'Bamako', 'Abidjan', 'Ouagadougou', 'Niamey', 'Lagos', 'Abuja',
      'Accra', 'Kinshasa', 'Brazzaville', 'Yaoundé', 'Douala', 'Libreville', 'Nairobi', 'Addis-Abeba', 'Addis Ababa', 'Kampala', 'Kigali', 'Dar es Salaam',
      'Johannesburg', 'Johannesbourg', 'Le Cap', 'Cape Town', 'Pretoria', 'Antananarivo', 'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Canberra',
      'Auckland', 'Wellington', 'Babylone', 'Babylon', 'Carthage', 'Troie', 'Troy', 'Pompéi', 'Pompeii', 'Jérusalem', 'Athènes', 'Sparte', 'Sparta',
      'Saint-Laurent', 'Mont-Royal', 'Outremont', 'Westmount', 'Verdun', 'Lachine', 'Rosemont', 'Plateau-Mont-Royal', 'Hochelaga', 'Ville-Marie',
      // Quelques noms en écritures non latines
      'Россия', 'Москва', 'Санкт-Петербург', 'Киев', 'Україна', 'Київ', 'Ελλάδα', 'Αθήνα', 'مصر', 'القاهرة', 'المغرب', 'الجزائر', 'تونس', 'لبنان',
      'بيروت', 'سوريا', 'دمشق', 'العراق', 'بغداد', 'فلسطين', 'القدس', 'السعودية', 'إيران', 'تهران', 'ישראל', 'ירושלים', 'תל אביב', 'भारत', 'दिल्ली',
      'मुंबई'
    ],

    /* Lieux en chinois / japonais / coréen (détection par segmentation) */
    cjkPlaces: [
      '中国', '中國', '北京', '上海', '香港', '台湾', '台灣', '台北', '广州', '廣州', '深圳', '南京', '西安', '武汉', '成都', '重庆', '天津', '杭州',
      '日本', '东京', '東京', '京都', '大阪', '横浜', '広島', '名古屋', '札幌', '韩国', '韓国', '韓國', '朝鲜', '首尔', '美国', '美國', '法国', '法國',
      '英国', '英國', '德国', '德國', '意大利', '西班牙', '俄罗斯', '俄羅斯', '加拿大', '魁北克', '蒙特利尔', '蒙特婁', '巴黎', '伦敦', '倫敦', '纽约',
      '紐約', '欧洲', '歐洲', '亚洲', '亞洲', '非洲', 'アメリカ', 'フランス', 'イギリス', 'ドイツ', 'カナダ', 'パリ', 'ロンドン', 'ニューヨーク',
      '대한민국', '한국', '서울', '부산', '일본', '중국', '미국', '캐나다', '프랑스', '파리', '도쿄'
    ],
    cjkOrgSuffixes: [
      '大学', '大學', '大学院', '学院', '學院', '研究所', '研究院', '研究中心', '博物馆', '博物館', '美术馆', '美術館', '图书馆', '圖書館', '図書館',
      '公司', '株式会社', '银行', '銀行', '协会', '協会', '協會', '委员会', '委員會', '委員会', '政府', '学校', '學校', '医院', '醫院', '病院', '基金会',
      '財団', '出版社', '新聞社', '电视台', '大학교', '대학교', '대학', '박물관', '도서관', '연구소', '은행', '협회', '정부', '미술관', '재단'
    ],
    cjkEventSuffixes: ['战争', '戰爭', '戦争', '革命', '奥运会', '奧運會', '博览会', '博覽會', '전쟁', '혁명', '올림픽'],

    /* ---------------- Mots-indices d'INSTITUTION / ORGANISATION ---------------- */
    orgCues: [
      'université', 'universités', 'university', 'universities', 'universität', 'universitat', 'universidad', 'università', 'universidade',
      'uniwersytet', 'universiteit', 'univ', 'collège', 'college', 'colegio', 'cégep', 'cegep', 'école', 'écoles', 'school', 'schools', 'schule',
      'escuela', 'scuola', 'escola', 'lycée', 'gymnasium', 'institut', 'instituts', 'institute', 'institutes', 'instituto', 'istituto', 'académie',
      'academy', 'akademie', 'academia', 'accademia', 'bibliothèque', 'bibliothèques', 'library', 'libraries', 'bibliothek', 'biblioteca', 'bibliotheca',
      'médiathèque', 'cinémathèque', 'musée', 'musées', 'museum', 'museums', 'museo', 'musei', 'museu', 'archives', 'archive', 'archiv', 'archivo',
      'archivio', 'galerie', 'gallery', 'galleria', 'ministère', 'ministry', 'ministerium', 'ministerio', 'ministero', 'département', 'department',
      'departamento', 'gouvernement', 'government', 'regierung', 'gobierno', 'governo', 'conseil', 'council', 'consejo', 'consiglio', 'commission',
      'kommission', 'comisión', 'comité', 'committee', 'agence', 'agency', 'agentur', 'agencia', 'fondation', 'foundation', 'stiftung', 'fundación',
      'fondazione', 'fundação', 'société', 'society', 'gesellschaft', 'sociedad', 'società', 'association', 'asociación', 'associazione', 'verein',
      'verband', 'fédération', 'federation', 'federación', 'confédération', 'union', 'syndicat', 'centre', 'center', 'centrum', 'zentrum', 'centro',
      'laboratoire', 'laboratory', 'labo', 'laboratorio', 'hôpital', 'hospital', 'krankenhaus', 'ospedale', 'clinique', 'clinic', 'banque', 'bank',
      'banco', 'banca', 'corporation', 'compagnie', 'company', 'group', 'groupe', 'gruppe', 'grupo', 'gruppo', 'entreprise', 'entreprises',
      'industries', 'holdings', 'partners', 'press', 'presses', 'éditions', 'publishing', 'publishers', 'verlag', 'editorial', 'edizioni', 'parlement',
      'parliament', 'parlamento', 'bundestag', 'assemblée', 'assembly', 'sénat', 'senate', 'senado', 'congress', 'tribunal', 'court', 'cour', 'gericht',
      'corte', 'église', 'church', 'kirche', 'iglesia', 'chiesa', 'diocèse', 'abbaye', 'abbey', 'orchestre', 'orchestra', 'orchester', 'chœur',
      'choeur', 'choir', 'conservatoire', 'conservatory', 'séminaire', 'seminary', 'club', 'parti', 'party', 'partei', 'partido', 'partito', 'ligue',
      'league', 'liga', 'police', 'polizei', 'gendarmerie', 'armée', 'army', 'navy', 'marine', 'forces', 'nations', 'organisation', 'organization',
      'organización', 'organizzazione', 'office', 'bureau', 'direction', 'secrétariat', 'secretariat', 'faculté', 'faculty', 'fakultät', 'facultad',
      'polytechnique', 'polytechnic', 'consortium', 'réseau', 'network', 'alliance', 'coopérative', 'cooperative', 'studio', 'studios', 'records',
      'airlines', 'airways', 'railway', 'railways', 'hydro', 'radio', 'télévision', 'television', 'cabinet', 'chambre', 'chamber', 'caisse', 'mouvement',
      'movement', 'théâtre', 'theatre', 'theater', 'teatro', 'opéra', 'opera'
    ],
    /* Organisations connues (nom complet) */
    knownOrgs: [
      'CNRS', 'UNESCO', 'OTAN', 'NATO', 'ONU', 'OMS', 'WHO', 'FBI', 'CIA', 'NASA', 'Google', 'Microsoft', 'Apple', 'Facebook', 'Meta', 'IBM',
      'Wikipédia', 'Wikipedia', 'Wikidata', 'YouTube', 'Netflix', 'Anthropic', 'OpenAI', 'Érudit', 'Erudit', 'BAnQ', 'UdeM', 'UQAM', 'McGill',
      'Concordia', 'INRS', 'HEC', 'HEC Montréal', 'Polytechnique Montréal', 'Hydro-Québec', 'Radio-Canada', 'CBC', 'BBC', 'CNN', 'Reuters', 'OCLC',
      'IFLA', 'ACFAS', 'Acfas', 'FRQ', 'CRSH', 'SSHRC', 'CRSNG', 'NSERC', 'IRSC', 'CIHR', 'Sorbonne', 'Harvard', 'Stanford', 'Yale', 'MIT', 'CERN',
      'Europeana', 'Gallica', 'HathiTrust', 'JSTOR', 'Elsevier', 'Springer', 'Wiley', 'Gallimard', 'Flammarion', 'Boréal', 'Twitter', 'Instagram',
      'LinkedIn', 'TikTok', 'Amazon', 'Tesla', 'Samsung', 'Sony', 'Toyota', 'Bombardier', 'Desjardins', 'Vidéotron', 'Bell', 'Rogers', 'Telus'
    ],
    /* ---------------- Mots-indices d'ÉVÉNEMENT ---------------- */
    eventCues: [
      'festival', 'festivals', 'congrès', 'colloque', 'symposium', 'symposion', 'conférence', 'conference', 'konferenz', 'conferencia', 'conferenza',
      'sommet', 'summit', 'gipfel', 'cumbre', 'guerre', 'guerres', 'war', 'wars', 'krieg', 'guerra', 'révolution', 'revolution', 'revolución',
      'rivoluzione', 'revolução', 'bataille', 'battle', 'schlacht', 'batalla', 'battaglia', 'siège', 'siege', 'crise', 'crisis', 'krise', 'jeux',
      'games', 'spiele', 'juegos', 'giochi', 'olympiques', 'olympics', 'olympic', 'olympia', 'paralympiques', 'paralympics', 'coupe', 'cup', 'pokal',
      'copa', 'coppa', 'championnat', 'championship', 'championships', 'meisterschaft', 'campeonato', 'campionato', 'tournoi', 'tournament', 'turnier',
      'torneo', 'exposition', 'expo', 'exhibition', 'ausstellung', 'exposición', 'mostra', 'biennale', 'biennial', 'triennale', 'salon', 'foire', 'fair',
      'messe', 'feria', 'fiera', 'marathon', 'carnaval', 'carnival', 'karneval', 'gala', 'rencontres', 'journées', 'semaine', 'week', 'forum', 'élection',
      'élections', 'election', 'elections', 'référendum', 'referendum', 'massacre', 'attentat', 'pandémie', 'pandemic', 'épidémie', 'epidemic',
      'séisme', 'earthquake', 'ouragan', 'hurricane', 'catastrophe', 'disaster', 'concile', 'traité', 'treaty', 'accord', 'accords', 'conquête',
      'conquest', 'insurrection', 'rébellion', 'rebellion', 'rébellions', 'grève', 'strike', 'manifestation', 'mondial', 'mundial', 'oktoberfest',
      'grand prix', 'jubilé', 'jubilee', 'ceremony', 'cérémonie', 'workshop', 'atelier', 'webinaire', 'webinar', 'hackathon', 'convention'
    ],
    /* ---------------- Mots-indices de LIEU ---------------- */
    placeCues: [
      'rue', 'avenue', 'av', 'boulevard', 'boul', 'bd', 'chemin', 'route', 'square', 'street', 'road', 'lane', 'drive', 'highway', 'autoroute', 'strasse',
      'straße', 'platz', 'calle', 'avenida', 'plaza', 'via', 'viale', 'piazza', 'rua', 'praça', 'mont', 'monts', 'mount', 'mt', 'montagne', 'montagnes',
      'mountain', 'mountains', 'monte', 'berg', 'lac', 'lacs', 'lake', 'lakes', 'lago', 'rivière', 'river', 'fleuve', 'fluss', 'río', 'rio', 'baie',
      'bay', 'golfe', 'gulf', 'océan', 'ocean', 'mer', 'sea', 'île', 'îles', 'island', 'islands', 'isla', 'isola', 'cap', 'cape', 'cabo', 'vallée',
      'valley', 'valle', 'forêt', 'forest', 'parc', 'park', 'parque', 'canyon', 'désert', 'desert', 'plateau', 'péninsule', 'peninsula', 'détroit',
      'strait', 'canal', 'port', 'harbour', 'harbor', 'quartier', 'district', 'arrondissement', 'comté', 'county', 'province', 'région', 'region',
      'territoire', 'territory', 'village', 'ville', 'city', 'town', 'municipalité', 'municipality', 'canton', 'oblast', 'préfecture', 'borough',
      'gare', 'station', 'aéroport', 'airport', 'pont', 'bridge', 'tower', 'château', 'castle', 'palais', 'palace', 'cathédrale', 'cathedral',
      'basilique', 'basilica', 'stade', 'stadium', 'aréna', 'arena', 'plage', 'beach', 'côte', 'coast', 'falls', 'chutes', 'glacier', 'volcan',
      'volcano', 'colline', 'hill', 'hills', 'marché', 'place', 'quai', 'pier', 'esplanade', 'jardin', 'jardins', 'garden', 'gardens', 'cimetière',
      'cemetery', 'oratoire'
    ],
    /* Mots (minuscules) qui, placés avant un titre, signalent une ŒUVRE */
    workCues: [
      'roman', 'romans', 'novel', 'novels', 'romanzo', 'novela', 'livre', 'livres', 'book', 'books', 'buch', 'libro', 'livro', 'ouvrage', 'ouvrages',
      'œuvre', 'oeuvre', 'film', 'films', 'movie', 'película', 'pelicula', 'documentaire', 'documentary', 'série', 'series', 'feuilleton', 'émission',
      'album', 'albums', 'chanson', 'chansons', 'song', 'songs', 'lied', 'canción', 'canzone', 'single', 'titre', 'titled', 'intitulé', 'intitulée',
      'intitulés', 'entitled', 'poème', 'poèmes', 'poem', 'poems', 'gedicht', 'poema', 'recueil', 'essai', 'essais', 'essay', 'article', 'conte', 'contes',
      'tale', 'pièce', 'play', 'drama', 'drame', 'tragédie', 'tragedy', 'comédie', 'comedy', 'opéra', 'opera', 'opérette', 'ballet', 'symphonie',
      'symphony', 'sinfonie', 'concerto', 'sonate', 'sonata', 'quatuor', 'quartet', 'requiem', 'oratorio', 'cantate', 'tableau', 'toile', 'painting',
      'peinture', 'gemälde', 'cuadro', 'dipinto', 'sculpture', 'statue', 'fresque', 'fresco', 'photographie', 'photograph', 'manuscrit', 'manuscript',
      'revue', 'magazine', 'périodique', 'journal', 'quotidien', 'hebdomadaire', 'newspaper', 'thèse', 'thesis', 'mémoire', 'rapport', 'report',
      'manga', 'bd', 'saga', 'trilogie', 'trilogy', 'épopée', 'anthologie', 'anthology', 'catalogue', 'dictionnaire', 'dictionary', 'encyclopédie',
      'encyclopedia', 'jeu', 'videogame', 'podcast', 'chapitre', 'nouvelle', 'nouvelles', 'bande', 'téléroman', 'sitcom', 'spectacle', 'show',
      'comédie musicale', 'musical', 'oeuvres', 'œuvres', 'pamphlet', 'traité', 'mémoires', 'autobiographie', 'biographie', 'biography',
      'роман', 'романа', 'фильм', 'фильма', 'книга', 'книгу', 'книги', 'поэма', 'поэму', 'пьеса', 'пьесу', 'опера', 'оперу', 'картина', 'картину',
      'альбом', 'песня', 'песню', 'повесть', 'рассказ', 'ταινία', 'βιβλίο', 'μυθιστόρημα'
    ],
    /* Verbes qui, juste avant un titre, signalent une ŒUVRE */
    workVerbs: ['wrote', 'writes', 'written', 'published', 'publishes', 'directed', 'composed', 'painted', 'écrit', 'écrivit', 'publie', 'publié',
      'publiée', 'réalise', 'réalisé', 'compose', 'composé', 'peint', 'escribió', 'publicó', 'schrieb', 'veröffentlichte', 'scrisse', 'escreveu',
      'starring', 'adapté', 'adapted'],
    /* Titres / fonctions qui précèdent un nom de PERSONNE */
    personTitles: [
      'm', 'mm', 'mme', 'mmes', 'mlle', 'mr', 'mrs', 'ms', 'miss', 'dr', 'dre', 'drs', 'pr', 'pre', 'prof', 'professeur', 'professeure', 'professor',
      'sir', 'dame', 'lady', 'lord', 'herr', 'frau', 'sr', 'sra', 'srta', 'don', 'doña', 'dona', 'sig', 'signor', 'signora', 'senator', 'sénateur',
      'sénatrice', 'gov', 'governor', 'gouverneur', 'président', 'présidente', 'president', 'presidente', 'ministre', 'minister', 'chancelier',
      'chancellor', 'kanzler', 'kanzlerin', 'juge', 'judge', 'maître', 'abbé', 'père', 'sœur', 'soeur', 'frère', 'father', 'sister', 'rev', 'reverend',
      'révérend', 'mgr', 'monseigneur', 'cardinal', 'pape', 'pope', 'roi', 'king', 'reine', 'queen', 'prince', 'princesse', 'princess', 'duc', 'duke',
      'duchesse', 'duchess', 'baron', 'baronne', 'marquis', 'marquise', 'empereur', 'emperor', 'impératrice', 'empress', 'tsar', 'sultan', 'cheikh',
      'sheikh', 'général', 'general', 'colonel', 'capitaine', 'captain', 'lieutenant', 'sergent', 'sergeant', 'commandant', 'commander', 'amiral',
      'admiral', 'maréchal', 'marshal', 'docteur', 'doctor', 'maestro', 'auteur', 'author', 'autrice', 'auteure', 'artiste', 'artist', 'écrivain',
      'écrivaine', 'writer', 'poète', 'poétesse', 'poet', 'peintre', 'painter', 'compositeur', 'compositrice', 'composer', 'réalisateur', 'réalisatrice',
      'director', 'acteur', 'actrice', 'actor', 'actress', 'chanteur', 'chanteuse', 'singer', 'philosophe', 'philosopher', 'chercheur', 'chercheuse',
      'researcher', 'journaliste', 'journalist', 'architecte', 'architect', 'photographe', 'photographer', 'sculpteur', 'sculptrice', 'joueur', 'joueuse',
      'player', 'entraîneur', 'coach', 'député', 'députée', 'maire', 'mairesse', 'mayor', 'ambassadeur', 'ambassadrice', 'ambassador', 'ceo', 'pdg',
      'directeur', 'directrice', 'fondateur', 'fondatrice', 'founder', 'romancier', 'romancière', 'novelist', 'historien', 'historienne', 'historian',
      'professeurs', 'docteure', 'bibliothécaire', 'librarian', 'conservateur', 'conservatrice', 'curator', 'saint', 'sainte', 'st', 'ste', 'san',
      'santa', 'mère', 'mother', 'oncle', 'tante', 'uncle', 'aunt', 'madame', 'monsieur', 'mademoiselle', 'señor', 'señora', 'signore'
    ],
    /* Mots suivant un nom de personne */
    personNext: [
      'dit', 'disait', 'explique', 'expliquait', 'déclare', 'affirme', 'écrit', 'écrivait', 'raconte', 'souligne', 'précise', 'ajoute', 'estime',
      'said', 'says', 'explained', 'explains', 'wrote', 'writes', 'told', 'stated', 'argued', 'noted', 'added', 'who', 'sagte', 'sagt', 'schrieb',
      'dijo', 'dice', 'escribió', 'disse', 'scrisse', 'né', 'née', 'born', 'died', 'décédé', 'décédée', 'meurt', 'naît', 'nacido', 'nata', 'nato',
      'geboren', 'himself', 'herself', 'lui-même', 'elle-même'
    ],
    /* Prépositions (avec accents) suggérant un lieu après elles */
    placePreps: ['à', 'au', 'aux', 'en', 'in', 'at', 'near', 'from', 'nach', 'aus', 'em', 'vers', 'près', 'outside', 'inside', 'throughout', 'across'],

    /* Mots fréquents en début de phrase à retirer au début d'une séquence en majuscules */
    startStopwords: (
      'the a an this that these those there here in on at for from with by as if when while but and or so yet after before during since until ' +
      'because although however therefore thus also then now today yesterday tomorrow it its he she they we you i my our your his her their what ' +
      'which who whom why how where all some many most more each every no not yes please read see click note our see also according ' +
      'le la les l un une des du de d ce cet cette ces il elle ils elles on nous vous je tu j dans sur sous pour par avec sans selon après apres ' +
      'avant depuis pendant lors mais et ou donc car si quand comme lorsque alors ainsi aussi cependant pourtant enfin puis ensuite voici voilà ' +
      'voila mon ma mes ton ta tes son sa ses notre nos votre vos leur leurs quel quelle quels quelles qui que quoi où tout tous toute toutes ' +
      'chaque plusieurs certains certaines aujourd hier demain oui non entre chez contre vers parmi malgré grâce lire voir cliquez ' +
      'der die das den dem ein eine einen einem und oder aber im am zum zur mit auf für bei nach vor es er sie wir ihr ich auch wenn als ' +
      'el los las un una unos unas y o pero con por para sin sobre este esta estos estas ese esa lo il gli nel nella della dello degli ' +
      'delle e ma per questo questa os as um uma em no na nos nas do da dos das mas com'
    ).split(/\s+/),
    /* Articles (ré-insérés au début d'un titre d'œuvre) */
    articles: ['le', 'la', 'les', "l'", 'the', 'a', 'an', 'un', 'une', 'el', 'los', 'las', 'der', 'die', 'das', 'il', 'lo', 'gli', 'o', 'os', 'as'],

    /* Mots de liaison autorisés DANS un nom propre (minuscules, avec accents) */
    connectors: [
      'de', 'du', 'des', "d'", 'la', 'le', 'les', "l'", 'of', 'the', 'von', 'van', 'vander', 'der', 'den', 'ter', 'te', 'di', 'da', 'del', 'della',
      'delle', 'dei', 'degli', 'dello', "dell'", 'do', 'dos', 'das', 'y', 'upon', 'zu', 'zum', 'zur', 'für', 'bin', 'ibn', 'al', 'el', 'ben', '&',
      'lès'
    ],
    /* Connecteurs autorisés seulement dans un nom d'institution / d'événement / de lieu */
    connectorsInCue: ['and', 'et', 'und', 'e', 'i', 'y', 'for', 'pour', 'per', 'para', 'por', 'für', 'on', 'sur', '&'],
    /* Conjonctions : doivent être suivies immédiatement d'un mot à majuscule */
    conjunctions: ['and', 'et', 'und', 'e', 'i', 'y', '&'],
    /* Adjectifs/noms en minuscules autorisés à l'intérieur d'un nom d'institution / événement / lieu */
    cueAdjectives: (
      'national nationale nationaux nationales international internationale internationaux internationales municipal municipale ' +
      'royal royale royaux fédéral fédérale provincial provinciale général générale supérieur supérieure supérieures scientifique ' +
      'scientifiques technique techniques technologique polytechnique public publique publiques central centrale régional régionale ' +
      'universitaire unies unis européen européenne canadien canadienne québécois québécoise américain américaine français française ' +
      'britannique mondial mondiale mondiaux métropolitain métropolitaine catholique protestant populaire musical musicale historique ' +
      'naturel naturelle naturelles contemporain contemporain contemporaine moderne ancien ancienne beaux-arts arts art recherche sciences ' +
      'science études lettres médecine droit nations archives musique olympiques olympique paralympiques mondiale décoratifs décoratives ' +
      'civilisation civilisations histoire santé société sociétés culture cultures patrimoine information informatique génie technologie ' +
      'économie économique économiques sociales social sociale politique politiques humaines humain environnement communication ' +
      'communications commerce affaires étrangères intérieur finances justice défense éducation enseignement ' +
      'nacional nacionales internacional nazionale nationaal nationalen'
    ).split(/\s+/),
    /* Particules de noms de personnes */
    nameParticles: ['de', 'du', 'des', "d'", 'la', 'le', 'van', 'von', 'der', 'den', 'ter', 'di', 'da', 'del', 'della', 'dos', 'das', 'do', 'bin', 'ibn', 'al', 'el', 'ben', 'y', 'zu', 'mac', 'mc', 'st', 'saint'],

    /* Mois (pour la reconnaissance des dates) — formes complètes et abrégées */
    months: (
      'janvier février fevrier mars avril mai juin juillet août aout septembre octobre novembre décembre decembre ' +
      'janv févr fevr avr juil sept déc ' +
      'january february march april may june july august september october november december jan feb apr aug sep oct nov dec ' +
      'enero febrero marzo abril mayo junio julio agosto septiembre setiembre octubre noviembre diciembre ' +
      'januar jänner februar märz april mai juni juli august september oktober november dezember ' +
      'gennaio febbraio marzo aprile maggio giugno luglio agosto settembre ottobre novembre dicembre ' +
      'janeiro fevereiro março abril maio junho julho agosto setembro outubro novembro dezembro'
    ).split(/\s+/),
    /* Mois et jours (ne doivent pas commencer un nom propre) */
    monthsDays: (
      'january february march april may june july august september october november december ' +
      'monday tuesday wednesday thursday friday saturday sunday ' +
      'januar februar märz april mai juni juli august september oktober november dezember ' +
      'montag dienstag mittwoch donnerstag freitag samstag sonntag ' +
      'janvier février mars avril juin juillet août septembre octobre novembre décembre lundi mardi mercredi jeudi vendredi samedi dimanche ' +
      'enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre lunes martes miércoles jueves viernes sábado domingo'
    ).split(/\s+/),
    /* Mots d'interface fréquents à ignorer lorsqu'ils sont seuls */
    uiWords: (
      'home menu contact search login logout accueil recherche rechercher connexion déconnexion english français francais deutsch español ' +
      'faq blog news nouvelles actualités about help aide privacy cookies terms ok more next previous suivant précédent top share partager ' +
      'print imprimer email courriel tweet like video vidéo photo photos image images pdf html url www http https copyright mobile version ' +
      'page pages section sections chapter figure fig table note notes références references sources source voir see menu navigation ' +
      'sommaire contents index retour back fermer close ouvrir open télécharger download plus moins edit modifier'
    ).split(/\s+/),
    /* Abréviations qui gardent leur point */
    abbreviations: (
      'm mm mme mlle mr mrs ms dr dre drs pr prof st ste mt jr sr sra inc ltd co corp cie no nº op vol vols univ dept gov rev mgr sen rep ' +
      'av ave boul bd blvd fig ed éd éds eds etc cf ca vs ph mgr gén gen col capt lt sgt adm'
    ).split(/\s+/),
    /* Mots-outils allemands (détection de l'allemand, où tous les noms prennent une majuscule) */
    germanFunctionWords: 'der die das und ist nicht mit sich auf für eine einen dem den des zu von wird sind wurde auch als bei nach aus'.split(' '),
    /* Pronoms (un passage entre guillemets qui en contient est probablement une citation, pas un titre) */
    pronouns: ['je', "j'", 'nous', 'vous', 'tu', 'i', 'we', 'you', 'my', 'our', 'me', 'moi', 'ich', 'wir', 'yo', 'nosotros', 'io', 'noi', 'eu', 'nós']
  };
})(typeof window !== 'undefined' ? window : globalThis);
