import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Copy, RefreshCw } from "lucide-react";

const RandomNameGenerator = () => {
  const [origin, setOrigin] = useState("american");
  const [gender, setGender] = useState("both");
  const [count, setCount] = useState("10");
  const [names, setNames] = useState<Array<{ first: string; last: string }>>([]);

  const nameData = {
    american: {
      male: ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles"],
      female: ["Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen"],
      last: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]
    },
    british: {
      male: ["Oliver", "George", "Harry", "Jack", "Jacob", "Charlie", "Thomas", "Oscar", "William", "James"],
      female: ["Olivia", "Amelia", "Emily", "Isla", "Ava", "Jessica", "Poppy", "Isabella", "Sophie", "Mia"],
      last: ["Smith", "Jones", "Williams", "Taylor", "Brown", "Davies", "Evans", "Wilson", "Thomas", "Roberts"]
    },
    spanish: {
      male: ["Santiago", "Mateo", "Sebastián", "Matías", "Diego", "Nicolás", "Alejandro", "Samuel", "Benjamín", "Lucas"],
      female: ["Sofía", "Isabella", "Valentina", "Camila", "Valeria", "Mariana", "Luciana", "Emma", "María", "Victoria"],
      last: ["García", "Rodríguez", "Martínez", "Hernández", "López", "González", "Pérez", "Sánchez", "Ramírez", "Torres"]
    },
    french: {
      male: ["Louis", "Gabriel", "Raphaël", "Arthur", "Lucas", "Jules", "Adam", "Hugo", "Léo", "Maël"],
      female: ["Emma", "Jade", "Louise", "Alice", "Chloé", "Lina", "Léa", "Manon", "Rose", "Camille"],
      last: ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau"]
    },
    german: {
      male: ["Ben", "Paul", "Jonas", "Finn", "Leon", "Luis", "Lukas", "Maximilian", "Felix", "Noah"],
      female: ["Mia", "Emma", "Hannah", "Sophia", "Anna", "Lena", "Leonie", "Marie", "Lara", "Emily"],
      last: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann"]
    }
  };

  const generateNames = () => {
    const num = parseInt(count);
    const data = nameData[origin as keyof typeof nameData];
    const generated: Array<{ first: string; last: string }> = [];

    for (let i = 0; i < num; i++) {
      let firstName: string;

      if (gender === "male") {
        firstName = data.male[Math.floor(Math.random() * data.male.length)];
      } else if (gender === "female") {
        firstName = data.female[Math.floor(Math.random() * data.female.length)];
      } else {
        // Both - randomly select from male or female
        const allFirst = [...data.male, ...data.female];
        firstName = allFirst[Math.floor(Math.random() * allFirst.length)];
      }

      const lastName = data.last[Math.floor(Math.random() * data.last.length)];
      generated.push({ first: firstName, last: lastName });
    }

    setNames(generated);
    toast.success(`Generated ${num} random names!`);
  };

  const copyName = (first: string, last: string) => {
    const fullName = `${first} ${last}`;
    navigator.clipboard.writeText(fullName);
    toast.success(`Copied: ${fullName}`);
  };

  return (
    <ToolLayout
      title="Random Name Generator"
      description="Generate random names from different countries and cultures. Perfect for testing, character creation, pen names. Free random name generator."
      category="Generators"
      instructions={[
        "Select name origin/culture",
        "Choose gender (Male, Female, or Both)",
        "Select how many names to generate",
        "Click generate and copy names"
      ]}
      relatedTools={[
        { name: "Fake Data Generator", path: "/tools/fake-data-generator" },
        { name: "Business Name Generator", path: "/tools/business-name-generator" },
        { name: "Random String Generator", path: "/tools/random-string-generator" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Name Origin</Label>
                <Select value={origin} onValueChange={setOrigin}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="american">American/English</SelectItem>
                    <SelectItem value="british">British</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Both (Mixed)</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Number of Names</Label>
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 names</SelectItem>
                    <SelectItem value="10">10 names</SelectItem>
                    <SelectItem value="20">20 names</SelectItem>
                    <SelectItem value="50">50 names</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={generateNames} className="w-full" size="lg">
              <User className="h-4 w-4 mr-2" />
              Generate Random Names
            </Button>
          </CardContent>
        </Card>

        {names.length > 0 && (
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Generated Names ({names.length})
                  </h3>
                </div>
                <Button onClick={generateNames} size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {names.map((name, index) => (
                  <button
                    key={index}
                    onClick={() => copyName(name.first, name.last)}
                    className="p-3 bg-muted/50 hover:bg-primary/10 rounded-lg text-left border border-transparent hover:border-primary/20 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{name.first} {name.last}</span>
                      <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Use Cases</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Testing:</strong> Generate test user names for applications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Writing:</strong> Create character names for stories</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Gaming:</strong> Generate character names for RPGs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Privacy:</strong> Use pseudonyms instead of real names</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Pen Names:</strong> Find the perfect author name</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default RandomNameGenerator;
