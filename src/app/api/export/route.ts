import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Expense from '@/lib/models/Expense';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();
    const userObjectId = new mongoose.Types.ObjectId(decoded.userId);

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    let query: any = { userId: userObjectId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const expenses = await Expense.find(query).sort({ date: -1 }).lean();

    if (format === 'pdf') {
      return await generateActualPDF(expenses, startDate, endDate);
    }

    // CSV export
    if (format === 'csv') {
      const csvHeaders = ['Date', 'Type', 'Category', 'Description', 'Amount'];
      const csvRows = expenses.map(expense => [
        new Date(expense.date).toLocaleDateString('en-IN'),
        expense.type,
        `"${expense.category}"`,
        `"${expense.description}"`,
        expense.amount
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="expenses-${startDate || 'all'}-to-${endDate || 'all'}.csv"`,
        }
      });
    }

    // JSON export
    const jsonData = JSON.stringify(expenses, null, 2);
    return new NextResponse(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="expenses-${startDate || 'all'}-to-${endDate || 'all'}.json"`,
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

// Generate actual PDF using jsPDF
async function generateActualPDF(expenses: any[], startDate?: string, endDate?: string) {
  // Dynamic import to avoid SSR issues
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF();

  // Calculate totals
  const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Title and header
  doc.setFontSize(20);
  doc.text('Expense Report', 20, 20);

  // Date range
  doc.setFontSize(12);
  doc.text(`Period: ${startDate || 'All time'} to ${endDate || 'present'}`, 20, 35);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 20, 45);

  // Summary
  doc.setFontSize(14);
  doc.text('Summary', 20, 65);
  doc.setFontSize(12);
  doc.text(`Total Income: ₹${totalIncome.toFixed(2)}`, 20, 80);
  doc.text(`Total Expenses: ₹${totalExpenses.toFixed(2)}`, 20, 90);
  doc.text(`Net Balance: ₹${balance.toFixed(2)}`, 20, 100);
  doc.text(`Total Transactions: ${expenses.length}`, 20, 110);

  // Transaction table
  const tableData = expenses.map(expense => [
    new Date(expense.date).toLocaleDateString('en-IN'),
    expense.type.toUpperCase(),
    expense.category,
    expense.description,
    `₹${expense.amount.toFixed(2)}`
  ]);

  // Generate table using autoTable
  autoTable(doc, {
    head: [['Date', 'Type', 'Category', 'Description', 'Amount']],
    body: tableData,
    startY: 125,
    styles: { 
      fontSize: 9,
      cellPadding: 3
    },
    headStyles: { 
      fillColor: [100, 100, 100],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: { 
      fillColor: [245, 245, 245] 
    },
    columnStyles: {
      4: { halign: 'right' } // Right-align amount column
    }
  });

  // Convert to buffer
  const pdfArrayBuffer = doc.output('arraybuffer');
  const pdfBuffer = Buffer.from(pdfArrayBuffer);

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="expenses-${startDate || 'all'}-to-${endDate || 'all'}.pdf"`,
      'Cache-Control': 'no-cache',
    }
  });
}
