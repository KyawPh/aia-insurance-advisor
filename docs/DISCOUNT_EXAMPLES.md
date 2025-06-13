# Discount Models Examples

## How to Change Discount Models

The new system makes it very easy to switch between different discount models. Here are examples:

### Current Model: "Save 2 months" (Pay for 10 months, get 12 months)
```typescript
yearlyDiscount: {
  type: 'months_free',
  value: 2
}
// Results in: "99,000 MMK/year (save 2 months)"
```

### Option 1: "12 for 13" (Pay for 12 months, get 1 bonus month)
```typescript
yearlyDiscount: {
  type: 'bonus_months',
  value: 1
}
// Results in: "118,800 MMK/year (get 1 bonus month)"
```

### Option 2: Percentage Discount
```typescript
yearlyDiscount: {
  type: 'percentage',
  value: 15
}
// Results in: "100,980 MMK/year (15% off - save 17,820 MMK)"
```

### Option 3: Custom Messaging
```typescript
yearlyDiscount: {
  type: 'custom',
  description: '118,800 MMK/year (13 months for the price of 12)'
}
// Results in: "118,800 MMK/year (13 months for the price of 12)"
```

## Dynamic Price Per Quote

The price per quote is now calculated automatically:
- **Starter Plan**: 9,900 MMK ÷ 50 quotes = 198 MMK per quote
- **Senior Plan**: 24,900 MMK ÷ 150 quotes = 166 MMK per quote

If you change the monthly price or quota limit, the price per quote updates automatically.

## Easy Future Changes

To implement your "12 for 13" model:

1. Change both plans to use `bonus_months`:
```typescript
yearlyDiscount: {
  type: 'bonus_months',
  value: 1
}
```

2. Update yearly prices to full 12-month pricing:
```typescript
monthlyPrice: 9900,
yearlyPrice: 118800, // 9900 * 12
```

The system will automatically:
- Calculate the correct price per quote
- Display "get 1 bonus month" messaging
- Handle all the pricing logic