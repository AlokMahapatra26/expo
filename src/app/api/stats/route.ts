import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Expense from '@/lib/models/Expense';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Convert userId string to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(decoded.userId);

    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    // Debug: Check if user has any expenses at all
    const totalExpenseCount = await Expense.countDocuments({ userId: userObjectId });
    console.log('Total expenses for user:', totalExpenseCount);

    const [totalIncomeResult, totalExpensesResult, monthlyIncomeResult, monthlyExpensesResult, categoryStats] = await Promise.all([
      // Total Income
      Expense.aggregate([
        { $match: { userId: userObjectId, type: 'income' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Total Expenses
      Expense.aggregate([
        { $match: { userId: userObjectId, type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Monthly Income
      Expense.aggregate([
        { 
          $match: { 
            userId: userObjectId, 
            type: 'income',
            date: { $gte: startOfMonth, $lte: endOfMonth }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Monthly Expenses
      Expense.aggregate([
        { 
          $match: { 
            userId: userObjectId, 
            type: 'expense',
            date: { $gte: startOfMonth, $lte: endOfMonth }
          } 
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Category Breakdown
      Expense.aggregate([
        { $match: { userId: userObjectId, type: 'expense' } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } }
      ])
    ]);

    // Extract totals safely - aggregation returns array, we need first element
    const totalIncome = totalIncomeResult.length > 0 ? totalIncomeResult[0].total : 0;
    const totalExpenses = totalExpensesResult.length > 0 ? totalExpensesResult[0].total : 0;
    const monthlyIncome = monthlyIncomeResult.length > 0 ? monthlyIncomeResult[0].total : 0;
    const monthlyExpenses = monthlyExpensesResult.length > 0 ? monthlyExpensesResult[0].total : 0;

    // Debug logging
    console.log('Aggregation results:', {
      totalIncomeResult,
      totalExpensesResult,
      totalIncome,
      totalExpenses
    });

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      monthlyIncome,
      monthlyExpenses,
      balance: totalIncome - totalExpenses,
      monthlyBalance: monthlyIncome - monthlyExpenses,
      categoryBreakdown: categoryStats,
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
