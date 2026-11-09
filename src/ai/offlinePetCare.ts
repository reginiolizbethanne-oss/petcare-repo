// Comprehensive Offline Knowledge & Consultation Engine for PetCare AI Assistant
// Provides instant, expert, offline veterinary advice for dogs, cats, and pets.

export interface OfflineConsultationResult {
  reply: string;
  topic: string;
  tokens: number;
}

export function generateOfflinePetCareReply(
  userQuery: string,
  petContext?: {
    name?: string;
    species?: string;
    breed?: string;
    age?: string;
    weight?: string;
    allergies?: string;
    diet?: string;
  }
): OfflineConsultationResult {
  const q = userQuery.toLowerCase().trim();
  const petName = petContext?.name || 'your pet';
  const species = (petContext?.species || 'dog').toLowerCase();
  const isCat = species.includes('cat') || species.includes('kitten') || q.includes('cat') || q.includes('pusa') || q.includes('kitten');

  // 1. Safe & Toxic Foods
  if (
    q.includes('safe food') ||
    q.includes('toxic') ||
    q.includes('poison') ||
    q.includes('chocolate') ||
    q.includes('grape') ||
    q.includes('onion') ||
    q.includes('garlic') ||
    q.includes('xylitol') ||
    q.includes('avocado') ||
    q.includes('bawal') ||
    q.includes('pwede ba') ||
    q.includes('food') ||
    q.includes('eat') ||
    q.includes('kain')
  ) {
    return {
      topic: 'Pet Nutrition & Food Safety',
      tokens: 420,
      reply: `### 🥗 Safe & Toxic Foods Guide for ${petName}

When feeding **${petName}**, safety comes first! Here is an essential breakdown of what is safe and what is dangerous:

#### 🚫 Strictly Toxic Foods (NEVER Feed):
- **Chocolate & Caffeine:** Contains theobromine and caffeine which cause cardiac arrhythmia, tremors, and seizures.
- **Grapes & Raisins:** Can trigger acute, irreversible kidney failure even in microscopic quantities.
- **Onions, Garlic, Leeks & Chives:** Contain thiosulfate which damages red blood cells and causes hemolytic anemia.
- **Xylitol (Birch Bark Extract / Artificial Sweetener):** Found in sugar-free gum, peanut butter, and baked goods; causes rapid insulin surge, acute hypoglycemia, and liver failure.
- **Macadamia Nuts & Walnuts:** Cause severe muscle weakness, hyperthermia, tremors, and vomiting.
- **Cooked Bones:** Splinter easily into razor-sharp shards, causing esophageal lacerations and intestinal perforation.
- **Alcohol & Raw Dough:** Ethanol toxicity and stomach bloating/obstruction.

#### ✅ 100% Safe Healthy Treats (In Moderation):
- **Plain Cooked Chicken, Turkey or Lean Beef** (unseasoned, bone-free, skinless).
- **Carrots & Green Beans:** Excellent low-calorie fiber snacks.
- **Apples** (seeds and core removed — seeds contain cyanide).
- **Blueberries & Watermelon** (seedless, rind removed).
- **Plain White or Brown Rice & Pumpkin Puree:** Gentle on sensitive stomachs during mild diarrhea.

> 💡 **Tip:** Always keep treats to under 10% of ${petName}'s daily calorie intake to maintain ideal body condition!`,
    };
  }

  // 2. Feeding Schedules & Portions
  if (
    q.includes('feeding') ||
    q.includes('schedule') ||
    q.includes('portion') ||
    q.includes('how much') ||
    q.includes('kibble') ||
    q.includes('meal') ||
    q.includes('diet') ||
    q.includes('pakain') ||
    q.includes('oras ng pagkain')
  ) {
    return {
      topic: 'Feeding Schedule & Portions',
      tokens: 380,
      reply: `### 🥣 Recommended Feeding Schedule for ${petName}

A structured feeding routine supports digestive health, stable energy levels, and prevents obesity:

#### 🕒 Ideal Meal Frequency:
- **Puppies & Kittens (under 6 months):** 3 to 4 small meals per day (rapid metabolism and small stomachs).
- **Juvenile Pets (6 to 12 months):** 2 to 3 meals per day.
- **Adult Pets (1 year and older):** **2 meals per day** (typically Morning around 7:00 AM and Evening around 6:00 PM).
- **Senior Pets (7+ years):** 2 smaller, easily digestible meals per day, formulated with joint and kidney support.

#### ⚖️ General Daily Portion Guidelines:
- **Toy Dogs (< 5 kg):** ~1/3 to 3/4 cup high-quality dry kibble daily.
- **Medium Dogs (10 - 25 kg):** ~1.5 to 2.5 cups daily, divided into 2 feedings.
- **Large Dogs (25 - 40 kg, like Golden Retrievers):** ~2.5 to 3.5 cups daily, divided into 2 feedings.
- **Adult Cats (4 - 5 kg):** ~1/3 to 1/2 cup dry kibble or one 3-ounce can of wet food plus 1/4 cup dry.

#### ⭐ Best Practices:
1. **Always measure with a standard measuring cup** — avoid eyeballing portions.
2. **Fresh, clean water** should be available 24/7. Wash water bowls daily to prevent bacterial film.
3. If switching foods, transition gradually over **7 days** (25% new, 50% new, 75% new, 100% new) to prevent gastric upset.`,
    };
  }

  // 3. Vaccines & Preventative Health
  if (
    q.includes('vaccine') ||
    q.includes('vaccination') ||
    q.includes('bakuna') ||
    q.includes('rabies') ||
    q.includes('dhpp') ||
    q.includes('deworm') ||
    q.includes('flea') ||
    q.includes('tick') ||
    q.includes('heartworm') ||
    q.includes('kuto')
  ) {
    return {
      topic: 'Vaccinations & Preventative Care',
      tokens: 410,
      reply: `### 💉 Essential Vaccines & Preventative Schedule for ${petName}

Vaccines and parasite preventatives are critical shields against life-threatening viral infections:

#### 🐕 For Dogs (Canine Schedule):
- **Core Vaccines (Mandatory):**
  - **DHPP / 5-in-1:** Protects against Distemper, Canine Hepatitis, Parvovirus, and Parainfluenza. Started at 6–8 weeks, booster every 3–4 weeks until 16 weeks, then annual/triennial booster.
  - **Rabies:** Required by law worldwide; initial dose at 12–16 weeks, booster after 1 year, then every 1–3 years.
- **Non-Core / Lifestyle Vaccines:**
  - **Bordetella (Kennel Cough):** Recommended if boarding, grooming, or visiting dog parks.
  - **Leptospirosis:** Protects against bacterial infection from stagnant water and rodent urine.

#### 🐱 For Cats (Feline Schedule):
- **FVRCP (3-in-1):** Protects against Feline Viral Rhinotracheitis, Calicivirus, and Panleukopenia (Feline Distemper).
- **Rabies:** Crucial for all cats (even indoor cats due to bats or accidental escapes).
- **FeLV (Feline Leukemia Virus):** Highly recommended for outdoor or multi-cat households.

#### 🛡️ Year-Round Parasite Prevention:
- **Heartworm Prevention:** Monthly chewable (e.g. NexGard Spectra, Heartgard) or annual injection. Heartworm is transmitted by mosquitoes and can be fatal if untreated.
- **Flea & Tick Prevention:** Monthly oral chewable or spot-on topical treatments.
- **Routine Deworming:** Every 3 months for adult pets; monthly for puppies and kittens.`,
    };
  }

  // 4. Weight & Body Condition
  if (
    q.includes('weight') ||
    q.includes('fitness') ||
    q.includes('body condition') ||
    q.includes('exercise') ||
    q.includes('obese') ||
    q.includes('fat') ||
    q.includes('taba') ||
    q.includes('payat') ||
    q.includes('exercise') ||
    q.includes('walk')
  ) {
    return {
      topic: 'Weight Management & Physical Fitness',
      tokens: 350,
      reply: `### 🏃 Weight & Fitness Management for ${petName}

Maintaining an ideal body weight can add up to **2.5 years** to your pet's life and protects against osteoarthritis, diabetes, and cardiovascular strain!

#### 🩺 The Body Condition Score (BCS 1–9):
- **Ideal Score (4 - 5 out of 9):**
  - Ribs easily felt with slight fat cover, no excess tissue over ribcage.
  - Waist easily visible when viewed from above (an "hourglass" tuck).
  - Abdominal tuck evident when viewed from the side.
- **Overweight (6 - 7 out of 9):**
  - Ribs difficult to palpate beneath heavy fat cover.
  - Waist barely discernible; fat deposits on spine and tail base.
- **Obese (8 - 9 out of 9):**
  - Ribs non-palpable under thick layer of fat. Distended abdomen with no waist.

#### 📋 Practical Weight Management Steps:
1. **Portion Control:** Cut back kibble volume by 10–15% if weight is trending upward, and swap high-calorie commercial treats for baby carrots, green beans, or cucumber slices.
2. **Daily Exercise:**
   - Active dogs (e.g., Retrievers, Shepherds): **45–60 minutes** daily brisk walking, fetch, or agility.
   - Small/brachycephalic dogs: **20–30 minutes** gentle walking in cool temperatures.
   - Cats: Two **10–15 minute** interactive play sessions daily with laser pointers, feather wands, or puzzle feeders.
3. **Log Weights Weekly:** Track ${petName}'s weight entries directly in PetCare to monitor progress curves!`,
    };
  }

  // 5. Emergency Symptoms & Red Flags
  if (
    q.includes('emergency') ||
    q.includes('sick') ||
    q.includes('vomit') ||
    q.includes('diarrhea') ||
    q.includes('suka') ||
    q.includes('tae') ||
    q.includes('dugo') ||
    q.includes('lethargic') ||
    q.includes('seizure') ||
    q.includes('breathe') ||
    q.includes('hininga') ||
    q.includes('vet')
  ) {
    return {
      topic: 'Veterinary Red Flags & Emergency Signs',
      tokens: 420,
      reply: `### 🚨 Emergency Symptoms: When to Call the Vet Immediately

If ${petName} exhibits any of the following symptoms, please contact your emergency veterinary clinic right away:

#### ⚠️ Critical Red Flags (Seek Immediate Care):
1. **Difficulty Breathing:** Rapid, shallow panting with blue/purple gums, neck extended, or wheezing.
2. **Bloated, Hard, Distended Abdomen:** In large dogs, pacing, retching without producing vomit is a sign of **GDV (Gastric Dilatation-Volvulus / Bloat)** — a life-threatening medical emergency.
3. **Inability to Urinate:** Straining without producing urine, crying out in the litter box (especially male cats) indicates an **urethral blockage**, fatal within 24–48 hours if untreated.
4. **Repeated Vomiting or Black/Bloody Stools:** Continuous vomiting (>2-3 times in a few hours) can rapidly lead to severe dehydration and electrolyte shock.
5. **Sudden Collapse, Seizures, or Unresponsiveness:** Lasting longer than 2 minutes or recurring cluster seizures.
6. **Ingestion of Known Toxins:** Rat poison, lilies (lethal to cats), human medications (NSAIDs, Tylenol), antifreeze, or chocolate.

#### 📞 Next Steps:
- Check the **Pets tab** in PetCare to immediately tap **"Call"** on your registered vet clinic (*Happy Paws Veterinary Clinic / Dr. Sarah Chen*).
- Keep ${petName} calm, warm, and transport them gently without pressure on the chest or abdomen.`,
    };
  }

  // 6. Greetings & General Inquiries
  if (
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q.includes('kamusta') ||
    q.includes('sino ka') ||
    q.includes('who are you') ||
    q.includes('tulong') ||
    q.includes('help')
  ) {
    return {
      topic: 'AI Vet Assistant Introduction',
      tokens: 280,
      reply: `### 🐾 Hello! I am your PetCare AI Assistant

I am your 100% offline, on-device veterinary health and wellness companion for **${petName}**! 

I can help you with:
- **🥗 Nutrition & Safe Foods:** Toxic ingredients, safe treats, dietary guidance.
- **🥣 Feeding Schedules:** Portions, meal timing, weight-specific nutrition.
- **💉 Vaccinations & Health:** Vaccine calendars, parasite control (ticks, fleas, heartworm).
- **🏃 Weight & Fitness:** Body condition scores, exercise routines, healthy habits.
- **🩺 Symptom Checks:** Advice on when to monitor at home vs. visiting the clinic.

Feel free to ask any question or tap one of the suggested topics below! How can I assist you and ${petName} today?`,
    };
  }

  // 7. General Comprehensive Pet Health Answer
  return {
    topic: 'Pet Care Guidance',
    tokens: 360,
    reply: `### 🐾 PetCare Health & Care Guidance for ${petName}

Thank you for your question regarding **"${userQuery}"**.

Here are the key veterinary recommendations for ${petName}:

1. **Daily Health Monitoring:**
   - Observe energy level, appetite, water consumption, and stool consistency.
   - Significant changes lasting over 24–48 hours warrant a professional veterinary check.

2. **Nutritional & Care Foundations:**
   - Feed balanced, life-stage appropriate food formulated for ${isCat ? 'felines' : 'canines'}.
   - Keep up with daily teeth brushing or dental treats to prevent periodontal disease.
   - Ensure routine flea, tick, and heartworm preventative treatments are administered on time.

3. **Behavioral Well-being:**
   - Consistent daily routines, mental enrichment (puzzle toys, scent walks), and positive reinforcement foster a calm, confident pet.

> 🩺 **Note:** If ${petName} is showing signs of acute pain, fever, continuous vomiting, or lethargy, please consult your veterinarian immediately or call your emergency contact listed on the **Pets** profile.

Can I assist you with specific feeding amounts, vaccination schedules, or safe food lists?`,
  };
}
