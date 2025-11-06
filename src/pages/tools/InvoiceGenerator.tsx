import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Download, Plus, Trash2 } from "lucide-react";
import { jsPDF } from 'jspdf';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

const InvoiceGenerator = () => {
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');

  const [fromName, setFromName] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [fromEmail, setFromEmail] = useState('');

  const [toName, setToName] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [toEmail, setToEmail] = useState('');

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, rate: 0 }
  ]);

  const [notes, setNotes] = useState('');

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, rate: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const generatePDF = () => {
    if (!fromName || !toName || items.some(item => !item.description)) {
      toast.error("Please fill in all required fields");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Title
    doc.setFontSize(24);
    doc.setTextColor(44, 62, 80);
    doc.text('INVOICE', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Invoice Details
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Invoice #: ${invoiceNumber}`, 20, yPos);
    doc.text(`Date: ${invoiceDate}`, 20, yPos + 5);
    if (dueDate) doc.text(`Due Date: ${dueDate}`, 20, yPos + 10);
    yPos += 25;

    // From Section
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('From:', 20, yPos);
    yPos += 6;
    doc.setFontSize(10);
    doc.text(fromName, 20, yPos);
    yPos += 5;
    if (fromAddress) {
      const addressLines = doc.splitTextToSize(fromAddress, 80);
      doc.text(addressLines, 20, yPos);
      yPos += addressLines.length * 5;
    }
    if (fromEmail) {
      doc.text(fromEmail, 20, yPos);
      yPos += 5;
    }

    // To Section
    yPos += 5;
    doc.setFontSize(12);
    doc.text('Bill To:', 20, yPos);
    yPos += 6;
    doc.setFontSize(10);
    doc.text(toName, 20, yPos);
    yPos += 5;
    if (toAddress) {
      const addressLines = doc.splitTextToSize(toAddress, 80);
      doc.text(addressLines, 20, yPos);
      yPos += addressLines.length * 5;
    }
    if (toEmail) {
      doc.text(toEmail, 20, yPos);
      yPos += 5;
    }

    // Items Table
    yPos += 10;
    doc.setFontSize(10);
    doc.setFillColor(52, 73, 94);
    doc.rect(20, yPos, pageWidth - 40, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('Description', 25, yPos + 5);
    doc.text('Qty', pageWidth - 80, yPos + 5);
    doc.text('Rate', pageWidth - 60, yPos + 5);
    doc.text('Amount', pageWidth - 30, yPos + 5, { align: 'right' });
    yPos += 10;

    doc.setTextColor(0, 0, 0);
    items.forEach((item) => {
      const amount = item.quantity * item.rate;
      doc.text(item.description, 25, yPos);
      doc.text(item.quantity.toString(), pageWidth - 80, yPos);
      doc.text(`$${item.rate.toFixed(2)}`, pageWidth - 60, yPos);
      doc.text(`$${amount.toFixed(2)}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 6;
    });

    // Total
    yPos += 5;
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 80, yPos, pageWidth - 20, yPos);
    yPos += 8;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Total:', pageWidth - 60, yPos);
    doc.text(`$${calculateTotal().toFixed(2)}`, pageWidth - 25, yPos, { align: 'right' });

    // Notes
    if (notes) {
      yPos += 15;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text('Notes:', 20, yPos);
      yPos += 6;
      const notesLines = doc.splitTextToSize(notes, pageWidth - 40);
      doc.text(notesLines, 20, yPos);
    }

    doc.save(`invoice-${invoiceNumber}.pdf`);
    toast.success("Invoice generated and downloaded!");
  };

  return (
    <ToolLayout
      title="Invoice Generator"
      description="Create professional invoices in seconds. Free invoice maker with PDF download - perfect for freelancers, small businesses, and contractors."
      category="Business Tools"
      instructions={[
        "Fill in your business details and client information",
        "Add invoice items with descriptions, quantities, and rates",
        "Review the total amount calculation",
        "Click 'Generate PDF' to create and download your invoice",
        "Optionally add notes or payment terms"
      ]}
      relatedTools={[
        { name: "Receipt Generator", path: "/tools/receipt-generator" },
        { name: "Tax Calculator", path: "/tools/tax-calculator" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Invoice Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Invoice Number</Label>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Invoice Date</Label>
                <Input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Due Date (Optional)</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            {/* From Section */}
            <div>
              <h3 className="font-semibold mb-3">From (Your Details)</h3>
              <div className="grid gap-3">
                <Input
                  placeholder="Your Name / Business Name *"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                />
                <Textarea
                  placeholder="Your Address"
                  value={fromAddress}
                  onChange={(e) => setFromAddress(e.target.value)}
                  rows={2}
                />
                <Input
                  placeholder="Your Email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                />
              </div>
            </div>

            {/* To Section */}
            <div>
              <h3 className="font-semibold mb-3">Bill To (Client Details)</h3>
              <div className="grid gap-3">
                <Input
                  placeholder="Client Name *"
                  value={toName}
                  onChange={(e) => setToName(e.target.value)}
                />
                <Textarea
                  placeholder="Client Address"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  rows={2}
                />
                <Input
                  placeholder="Client Email"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Invoice Items</h3>
                <Button onClick={addItem} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-6">
                      <Input
                        placeholder="Description *"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        placeholder="Rate ($)"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      {items.length > 1 && (
                        <Button
                          onClick={() => removeItem(index)}
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-4 p-4 bg-primary/5 rounded-lg flex justify-between items-center">
                <span className="font-semibold text-lg">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>Notes / Payment Terms (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment due within 30 days&#10;Thank you for your business!"
                rows={3}
                className="mt-2"
              />
            </div>

            {/* Generate Button */}
            <Button onClick={generatePDF} size="lg" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Generate PDF Invoice
            </Button>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default InvoiceGenerator;
