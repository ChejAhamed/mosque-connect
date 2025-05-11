"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

// Dummy hadith data for the MVP
const DUMMY_HADITHS = [
  {
    id: "1",
    title: "The Importance of Intention",
    narration: {
      arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
      english: "Actions are judged by intentions, so each man will have what he intended.",
    },
    narrator: "Umar ibn Al-Khattab",
    source: "Sahih al-Bukhari 1, Sahih Muslim 1907",
    authenticity: "Sahih",
    chapter: "Revelation",
    explanation: "This hadith emphasizes the importance of intention in Islam. Every action is judged based on the intention behind it. This is one of the most fundamental principles in Islamic jurisprudence.",
    themes: ["Intention", "Actions", "Judgment"],
  },
  {
    id: "2",
    title: "The Best of People",
    narration: {
      arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
      english: "The best of you are those who learn the Quran and teach it.",
    },
    narrator: "Uthman ibn Affan",
    source: "Sahih al-Bukhari 5027",
    authenticity: "Sahih",
    chapter: "Virtues of the Quran",
    explanation: "This hadith highlights the special status given to those who learn and teach the Quran. It encourages Muslims to engage with the Quran both as students and as teachers.",
    themes: ["Quran", "Knowledge", "Teaching"],
  },
  {
    id: "3",
    title: "Purification is Half of Faith",
    narration: {
      arabic: "الطُّهُورُ شَطْرُ الإِيمَانِ",
      english: "Purification is half of faith.",
    },
    narrator: "Abu Malik Al-Ashari",
    source: "Sahih Muslim 223",
    authenticity: "Sahih",
    chapter: "Purification",
    explanation: "This hadith emphasizes the importance of physical and spiritual cleanliness in Islam. It indicates that purification, both physical (wudu, ghusl) and spiritual (from sins), constitutes a significant portion of the faith.",
    themes: ["Purification", "Faith", "Cleanliness"],
  },
  {
    id: "4",
    title: "Kindness to Parents",
    narration: {
      arabic: "رِضَا الرَّبِّ فِي رِضَا الْوَالِدِ، وَسَخَطُ الرَّبِّ فِي سَخَطِ الْوَالِدِ",
      english: "The pleasure of the Lord lies in the pleasure of the parent, and the displeasure of the Lord lies in the displeasure of the parent.",
    },
    narrator: "Abdullah ibn Amr",
    source: "Sunan al-Tirmidhi 1899",
    authenticity: "Hasan",
    chapter: "Righteousness and Good Relations",
    explanation: "This hadith highlights the importance of treating parents with respect and kindness. It indicates that pleasing one's parents leads to Allah's pleasure, while displeasing them leads to Allah's displeasure.",
    themes: ["Parents", "Family", "Good Treatment"],
  },
  {
    id: "5",
    title: "The Strong Believer",
    narration: {
      arabic: "الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ، وَفِي كُلٍّ خَيْرٌ",
      english: "The strong believer is better and more beloved to Allah than the weak believer, although there is good in both.",
    },
    narrator: "Abu Hurayrah",
    source: "Sahih Muslim 2664",
    authenticity: "Sahih",
    chapter: "Destiny",
    explanation: "This hadith encourages Muslims to be strong in faith, character, and physicality. It emphasizes that while all believers are valuable, those who are stronger in these aspects are more capable of serving Islam and society.",
    themes: ["Strength", "Faith", "Determination"],
  },
  {
    id: "6",
    title: "Supporting Others",
    narration: {
      arabic: "مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا، نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ",
      english: "Whoever relieves a believer of a hardship in this world, Allah will relieve him of a hardship on the Day of Resurrection.",
    },
    narrator: "Abu Hurayrah",
    source: "Sahih Muslim 2699",
    authenticity: "Sahih",
    chapter: "Remembrance and Supplication",
    explanation: "This hadith encourages Muslims to help others in difficulty. It teaches that the reward for helping someone in this world is that Allah will help the person on the Day of Judgment.",
    themes: ["Helping Others", "Reward", "Day of Judgment"],
  },
  {
    id: "7",
    title: "Modesty and Faith",
    narration: {
      arabic: "الْحَيَاءُ شُعْبَةٌ مِنَ الإِيمَانِ",
      english: "Modesty is a branch of faith.",
    },
    narrator: "Abu Hurayrah",
    source: "Sahih al-Bukhari 9, Sahih Muslim 35",
    authenticity: "Sahih",
    chapter: "Faith",
    explanation: "This hadith emphasizes that modesty and shyness from committing sinful or shameful deeds is an integral part of faith. It encourages Muslims to maintain modesty in their conduct and appearance.",
    themes: ["Modesty", "Faith", "Character"],
  },
  {
    id: "8",
    title: "Truthfulness Leads to Paradise",
    narration: {
      arabic: "عَلَيْكُمْ بِالصِّدْقِ فَإِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ",
      english: "Adhere to truthfulness, for truthfulness leads to righteousness, and righteousness leads to Paradise.",
    },
    narrator: "Abdullah ibn Masud",
    source: "Sahih al-Bukhari 6094, Sahih Muslim 2607",
    authenticity: "Sahih",
    chapter: "Good Manners",
    explanation: "This hadith encourages Muslims to always be truthful. It teaches that truthfulness is a path to righteousness, which ultimately leads to Paradise. It warns against lying, which leads to wrongdoing and ultimately to Hellfire.",
    themes: ["Truthfulness", "Righteousness", "Paradise"],
  },
];

export default function HadithPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [narratorFilter, setNarratorFilter] = useState("all");
  const [themeFilter, setThemeFilter] = useState("all");
  const [authenticityFilter, setAuthenticityFilter] = useState("all");

  // Extract unique narrators from the hadiths for filter options
  const narrators = [...new Set(DUMMY_HADITHS.map((hadith) => hadith.narrator))];

  // Extract unique themes from the hadiths for filter options
  const themes = [...new Set(DUMMY_HADITHS.flatMap((hadith) => hadith.themes))];

  // Extract unique authenticity levels
  const authenticityLevels = [...new Set(DUMMY_HADITHS.map((hadith) => hadith.authenticity))];

  // Filter the hadiths based on search term and filters
  const filteredHadiths = DUMMY_HADITHS.filter((hadith) => {
    const matchesSearch = searchTerm
      ? hadith.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hadith.narration.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hadith.explanation.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesNarrator = narratorFilter === "all"
      ? true
      : hadith.narrator === narratorFilter;

    const matchesTheme = themeFilter === "all"
      ? true
      : hadith.themes.includes(themeFilter);

    const matchesAuthenticity = authenticityFilter === "all"
      ? true
      : hadith.authenticity === authenticityFilter;

    return matchesSearch && matchesNarrator && matchesTheme && matchesAuthenticity;
  });

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Hadith Search</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Search for authentic hadiths by keyword, narrator, theme, or authenticity level.
        </p>
      </div>

      {/* Search and filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Input
            placeholder="Search hadiths..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Select
            value={narratorFilter}
            onValueChange={setNarratorFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by narrator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Narrators</SelectItem>
              {narrators.map((narrator) => (
                <SelectItem key={narrator} value={narrator}>
                  {narrator}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select
            value={themeFilter}
            onValueChange={setThemeFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Themes</SelectItem>
              {themes.map((theme) => (
                <SelectItem key={theme} value={theme}>
                  {theme}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select
            value={authenticityFilter}
            onValueChange={setAuthenticityFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by authenticity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {authenticityLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-6 text-sm text-gray-500">
        {filteredHadiths.length === 0
          ? "No hadiths found matching your criteria."
          : `Found ${filteredHadiths.length} ${
              filteredHadiths.length === 1 ? "hadith" : "hadiths"
            } matching your criteria.`}
      </div>

      {/* Hadiths list */}
      <div className="space-y-6">
        {filteredHadiths.map((hadith) => (
          <Card key={hadith.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold mb-2">{hadith.title}</h2>
                <div className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                  {hadith.authenticity}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-right font-arabic text-lg mb-2 text-gray-800">
                  {hadith.narration.arabic}
                </p>
                <p className="text-gray-700 italic">
                  "{hadith.narration.english}"
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Narrator:</span> {hadith.narrator}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Source:</span> {hadith.source}
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-md font-semibold mb-1">Explanation</h3>
                <p className="text-gray-700">{hadith.explanation}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {hadith.themes.map((theme) => (
                  <span
                    key={theme}
                    className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded cursor-pointer hover:bg-green-200"
                    onClick={() => setThemeFilter(theme)}
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHadiths.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No hadiths found</h3>
          <p className="text-gray-600">
            Try adjusting your search filters or try a different search term.
          </p>
        </div>
      )}
    </div>
  );
}
