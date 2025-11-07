import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Download, Plus, Trash2, FileSpreadsheet, FileText } from "lucide-react";
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
];

const InvoiceGenerator = () => {
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [currency, setCurrency] = useState<Currency>(currencies[0]);

  const [fromName, setFromName] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromPhone, setFromPhone] = useState('');
  const [fromTaxId, setFromTaxId] = useState('');

  const [toName, setToName] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [toEmail, setToEmail] = useState('');
  const [toPhone, setToPhone] = useState('');

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, rate: 0 }
  ]);

  const [taxRate, setTaxRate] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [notes, setNotes] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Payment due within 30 days');

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

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === 'percentage') {
      return subtotal * (discountValue / 100);
    }
    return discountValue;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return (subtotal - discount) * (taxRate / 100);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    return subtotal - discount + tax;
  };

  const formatCurrency = (amount: number) => {
    return `${currency.symbol}${amount.toFixed(2)}`;
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
    doc.setFontSize(28);
    doc.setTextColor(44, 62, 80);
    doc.text('INVOICE', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Invoice Details
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Invoice #: ${invoiceNumber}`, 20, yPos);
    doc.text(`Date: ${invoiceDate}`, 20, yPos + 5);
    if (dueDate) doc.text(`Due Date: ${dueDate}`, 20, yPos + 10);
    doc.text(`Currency: ${currency.code}`, 20, yPos + 15);
    yPos += 30;

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
    if (fromPhone) {
      doc.text(fromPhone, 20, yPos);
      yPos += 5;
    }
    if (fromTaxId) {
      doc.text(`Tax ID: ${fromTaxId}`, 20, yPos);
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
    if (toPhone) {
      doc.text(toPhone, 20, yPos);
      yPos += 5;
    }

    // Items Table Header
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

    // Items
    doc.setTextColor(0, 0, 0);
    items.forEach((item) => {
      const amount = item.quantity * item.rate;
      const descLines = doc.splitTextToSize(item.description, 100);
      doc.text(descLines, 25, yPos);
      doc.text(item.quantity.toString(), pageWidth - 80, yPos);
      doc.text(formatCurrency(item.rate), pageWidth - 60, yPos);
      doc.text(formatCurrency(amount), pageWidth - 25, yPos, { align: 'right' });
      yPos += Math.max(descLines.length * 5, 6);
    });

    // Calculations
    yPos += 5;
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    const total = calculateTotal();

    doc.setLineWidth(0.5);
    doc.line(pageWidth - 80, yPos, pageWidth - 20, yPos);
    yPos += 8;

    // Subtotal
    doc.text('Subtotal:', pageWidth - 60, yPos);
    doc.text(formatCurrency(subtotal), pageWidth - 25, yPos, { align: 'right' });
    yPos += 6;

    // Discount
    if (discountValue > 0) {
      const discountLabel = discountType === 'percentage' ? `Discount (${discountValue}%):` : 'Discount:';
      doc.text(discountLabel, pageWidth - 60, yPos);
      doc.text(`-${formatCurrency(discount)}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 6;
    }

    // Tax
    if (taxRate > 0) {
      doc.text(`Tax (${taxRate}%):`, pageWidth - 60, yPos);
      doc.text(formatCurrency(tax), pageWidth - 25, yPos, { align: 'right' });
      yPos += 6;
    }

    // Total
    yPos += 2;
    doc.setLineWidth(1);
    doc.line(pageWidth - 80, yPos, pageWidth - 20, yPos);
    yPos += 8;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Total:', pageWidth - 60, yPos);
    doc.text(formatCurrency(total), pageWidth - 25, yPos, { align: 'right' });

    // Payment Terms
    if (paymentTerms) {
      yPos += 15;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text('Payment Terms:', 20, yPos);
      yPos += 6;
      const termsLines = doc.splitTextToSize(paymentTerms, pageWidth - 40);
      doc.text(termsLines, 20, yPos);
      yPos += termsLines.length * 5 + 5;
    }

    // Notes
    if (notes) {
      yPos += 5;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text('Notes:', 20, yPos);
      yPos += 6;
      const notesLines = doc.splitTextToSize(notes, pageWidth - 40);
      doc.text(notesLines, 20, yPos);
    }

    doc.save(`invoice-${invoiceNumber}.pdf`);
    toast.success("PDF invoice generated and downloaded!");
  };

  const generateExcel = () => {
    if (!fromName || !toName || items.some(item => !item.description)) {
      toast.error("Please fill in all required fields");
      return;
    }

    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const tax = calculateTax();
    const total = calculateTotal();

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Invoice header data
    const headerData = [
      ['INVOICE'],
      [],
      ['Invoice Number:', invoiceNumber],
      ['Invoice Date:', invoiceDate],
      ['Due Date:', dueDate || 'N/A'],
      ['Currency:', currency.code],
      [],
      ['FROM:'],
      ['Name:', fromName],
      ['Address:', fromAddress],
      ['Email:', fromEmail],
      ['Phone:', fromPhone],
      ['Tax ID:', fromTaxId],
      [],
      ['BILL TO:'],
      ['Name:', toName],
      ['Address:', toAddress],
      ['Email:', toEmail],
      ['Phone:', toPhone],
      [],
      ['ITEMS:'],
      ['Description', 'Quantity', 'Rate', 'Amount'],
    ];

    // Add items
    const itemsData = items.map(item => [
      item.description,
      item.quantity,
      item.rate,
      item.quantity * item.rate
    ]);

    // Summary data
    const summaryData = [
      [],
      ['Subtotal:', '', '', subtotal],
    ];

    if (discountValue > 0) {
      summaryData.push(['Discount:', '', '', -discount]);
    }

    if (taxRate > 0) {
      summaryData.push([`Tax (${taxRate}%):`, '', '', tax]);
    }

    summaryData.push(['TOTAL:', '', '', total]);

    if (paymentTerms) {
      summaryData.push([]);
      summaryData.push(['Payment Terms:', paymentTerms]);
    }

    if (notes) {
      summaryData.push([]);
      summaryData.push(['Notes:', notes]);
    }

    // Combine all data
    const allData = [...headerData, ...itemsData, ...summaryData];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(allData);

    // Set column widths
    ws['!cols'] = [
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 }
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Invoice');

    // Generate file
    XLSX.writeFile(wb, `invoice-${invoiceNumber}.xlsx`);
    toast.success("Excel invoice generated and downloaded!");
  };

  return (
    <ToolLayout
      title="Invoice Generator"
      description="Create professional invoices with PDF and Excel download. Free invoice maker with multiple currencies, tax calculation, and discount options - perfect for freelancers, small businesses, and contractors."
      category="Business Tools"
      instructions={[
        "Select your preferred currency from 15+ options",
        "Fill in your business details and client information",
        "Add invoice items with descriptions, quantities, and rates",
        "Add tax percentage and discount if applicable",
        "Download as PDF for sending or Excel for record-keeping",
        "Customize payment terms and add notes"
      ]}
      relatedTools={[
        { name: "Excel to CSV", path: "/tools/excel-to-csv" },
        { name: "PDF Merger", path: "/tools/pdf-merger" }
      ]}
    >
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Invoice Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <div>
                <Label>Currency</Label>
                <Select value={currency.code} onValueChange={(code) => {
                  const selected = currencies.find(c => c.code === code);
                  if (selected) setCurrency(selected);
                }}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.code} - {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Your Email"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                  />
                  <Input
                    placeholder="Your Phone"
                    value={fromPhone}
                    onChange={(e) => setFromPhone(e.target.value)}
                  />
                </div>
                <Input
                  placeholder="Tax ID / Business Registration Number"
                  value={fromTaxId}
                  onChange={(e) => setFromTaxId(e.target.value)}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="Client Email"
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                  />
                  <Input
                    placeholder="Client Phone"
                    value={toPhone}
                    onChange={(e) => setToPhone(e.target.value)}
                  />
                </div>
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
                        placeholder={`Rate (${currency.symbol})`}
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
            </div>

            {/* Tax and Discount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tax Rate (%)</Label>
                <Input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  step="0.01"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Discount</Label>
                <div className="flex gap-2 mt-2">
                  <Select value={discountType} onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">%</SelectItem>
                      <SelectItem value="fixed">{currency.symbol}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Total Summary */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              {discountValue > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-{formatCurrency(calculateDiscount())}</span>
                </div>
              )}
              {taxRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tax ({taxRate}%):</span>
                  <span>{formatCurrency(calculateTax())}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold text-lg">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>

            {/* Payment Terms */}
            <div>
              <Label>Payment Terms</Label>
              <Textarea
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="Payment due within 30 days"
                rows={2}
                className="mt-2"
              />
            </div>

            {/* Notes */}
            <div>
              <Label>Additional Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Thank you for your business!"
                rows={3}
                className="mt-2"
              />
            </div>

            {/* Generate Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={generatePDF} size="lg" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Download as PDF
              </Button>
              <Button onClick={generateExcel} size="lg" variant="outline" className="w-full">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download as Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
};

export default InvoiceGenerator;
