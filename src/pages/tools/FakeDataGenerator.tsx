import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Database, Copy } from "lucide-react";

const FakeDataGenerator = () => {
  const [dataType, setDataType] = useState("person");
  const [count, setCount] = useState("10");
  const [format, setFormat] = useState("json");
  const [generatedData, setGeneratedData] = useState("");

  const firstNames = ["John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Lisa", "James", "Mary", "William", "Jennifer", "Richard", "Linda", "Thomas", "Patricia"];
  const lastNames = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White"];
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "example.com", "mail.com"];
  const streets = ["Main St", "Oak Ave", "Maple Dr", "Pine Rd", "Elm St", "Washington Blvd", "Park Ave", "Lake Rd"];
  const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego"];
  const states = ["NY", "CA", "IL", "TX", "AZ", "PA", "FL", "OH"];
  const companies = ["Tech Corp", "Data Systems", "Global Solutions", "Digital Partners", "Innovation Labs", "Cloud Services"];

  const randomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  const randomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  const generatePerson = () => {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    return {
      id: Math.random().toString(36).substr(2, 9),
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNumber(1, 999)}@${randomItem(domains)}`,
      phone: `+1 (${randomNumber(200, 999)}) ${randomNumber(200, 999)}-${randomNumber(1000, 9999)}`,
      address: {
        street: `${randomNumber(100, 9999)} ${randomItem(streets)}`,
        city: randomItem(cities),
        state: randomItem(states),
        zipCode: randomNumber(10000, 99999).toString()
      },
      age: randomNumber(18, 75),
      company: randomItem(companies),
      jobTitle: randomItem(["Developer", "Manager", "Designer", "Analyst", "Engineer", "Consultant"])
    };
  };

  const generateData = () => {
    const num = parseInt(count);
    const data: any[] = [];

    for (let i = 0; i < num; i++) {
      if (dataType === "person") {
        data.push(generatePerson());
      } else if (dataType === "email") {
        const firstName = randomItem(firstNames).toLowerCase();
        const lastName = randomItem(lastNames).toLowerCase();
        data.push(`${firstName}.${lastName}${randomNumber(1, 999)}@${randomItem(domains)}`);
      } else if (dataType === "phone") {
        data.push(`+1 (${randomNumber(200, 999)}) ${randomNumber(200, 999)}-${randomNumber(1000, 9999)}`);
      } else if (dataType === "address") {
        data.push({
          street: `${randomNumber(100, 9999)} ${randomItem(streets)}`,
          city: randomItem(cities),
          state: randomItem(states),
          zipCode: randomNumber(10000, 99999).toString()
        });
      } else if (dataType === "company") {
        data.push({
          name: randomItem(companies),
          email: `contact@${randomItem(companies).toLowerCase().replace(/\s+/g, "")}.com`,
          phone: `+1 (${randomNumber(200, 999)}) ${randomNumber(200, 999)}-${randomNumber(1000, 9999)}`,
          website: `www.${randomItem(companies).toLowerCase().replace(/\s+/g, "")}.com`
        });
      }
    }

    let output = "";
    if (format === "json") {
      output = JSON.stringify(data, null, 2);
    } else if (format === "csv") {
      if (dataType === "person") {
        output = "ID,FirstName,LastName,Email,Phone,Street,City,State,ZipCode,Age,Company,JobTitle\n";
        data.forEach((p: any) => {
          output += `${p.id},${p.firstName},${p.lastName},${p.email},${p.phone},"${p.address.street}",${p.address.city},${p.address.state},${p.address.zipCode},${p.age},${p.company},${p.jobTitle}\n`;
        });
      } else if (dataType === "address") {
        output = "Street,City,State,ZipCode\n";
        data.forEach((a: any) => output += `"${a.street}",${a.city},${a.state},${a.zipCode}\n`);
      } else if (dataType === "company") {
        output = "Name,Email,Phone,Website\n";
        data.forEach((c: any) => output += `${c.name},${c.email},${c.phone},${c.website}\n`);
      } else {
        output = data.join("\n");
      }
    } else {
      output = data.map((d: any) => typeof d === 'string' ? d : JSON.stringify(d)).join("\n");
    }

    setGeneratedData(output);
    toast.success(`Generated ${num} fake ${dataType} records!`);
  };

  return (
    <ToolLayout
      title="Fake Data Generator"
      description="Generate realistic fake data for testing. Create dummy users, emails, phones, addresses, companies. Perfect for developers. Free fake data generator."
      category="Generators"
      instructions={[
        "Select data type to generate",
        "Choose number of records",
        "Pick output format (JSON, CSV, Text)",
        "Generate and copy test data"
      ]}
      relatedTools={[
        { name: "Random String Generator", path: "/tools/random-string-generator" },
        { name: "UUID Generator", path: "/tools/uuid-generator" },
        { name: "Random Name Generator", path: "/tools/random-name-generator" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Data Type</Label>
                <Select value={dataType} onValueChange={setDataType}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="person">Person (Full Profile)</SelectItem>
                    <SelectItem value="email">Email Addresses</SelectItem>
                    <SelectItem value="phone">Phone Numbers</SelectItem>
                    <SelectItem value="address">Addresses</SelectItem>
                    <SelectItem value="company">Company Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Number of Records</Label>
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 records</SelectItem>
                    <SelectItem value="10">10 records</SelectItem>
                    <SelectItem value="25">25 records</SelectItem>
                    <SelectItem value="50">50 records</SelectItem>
                    <SelectItem value="100">100 records</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Output Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="text">Plain Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={generateData} className="w-full" size="lg">
              <Database className="h-4 w-4 mr-2" />
              Generate Fake Data
            </Button>
          </CardContent>
        </Card>

        {generatedData && (
          <Card className="border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label>Generated Test Data</Label>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedData);
                    toast.success("Data copied to clipboard!");
                  }}
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={generatedData}
                readOnly
                className="font-mono text-xs"
                rows={15}
                onClick={(e) => e.currentTarget.select()}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Use Cases</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Testing:</strong> Populate databases with realistic test data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Development:</strong> Mock user data for development</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Demos:</strong> Create sample data for presentations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Training:</strong> Generate practice datasets</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span><strong>Privacy:</strong> Use fake data instead of real user information</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default FakeDataGenerator;
