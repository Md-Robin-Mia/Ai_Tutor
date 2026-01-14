import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, CreditCard, Smartphone, Building } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    price: number;
    thumbnail: string;
    instructor: string;
  };
  onSuccess: (transactionId: string) => void;
}

interface PaymentFormData {
  paymentMethod: 'credit_card' | 'debit_card' | 'nagad' | 'bikash' | 'rocket' | 'bank_transfer';
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
  phoneNumber?: string;
  transactionId?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  course,
  onSuccess
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    paymentMethod: 'credit_card'
  });

  const handlePaymentMethodChange = (method: PaymentFormData['paymentMethod']) => {
    setFormData(prev => ({ ...prev, paymentMethod: method }));
    setError(null);
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    switch (formData.paymentMethod) {
      case 'credit_card':
      case 'debit_card':
        if (!formData.cardNumber?.replace(/\s/g, '') || formData.cardNumber.replace(/\s/g, '').length !== 16) {
          setError('Please enter a valid 16-digit card number');
          return false;
        }
        if (!formData.cardHolder) {
          setError('Please enter card holder name');
          return false;
        }
        if (!formData.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
          setError('Please enter a valid expiry date (MM/YY)');
          return false;
        }
        if (!formData.cvv || formData.cvv.length !== 3) {
          setError('Please enter a valid 3-digit CVV');
          return false;
        }
        break;
      
      case 'nagad':
      case 'bikash':
      case 'rocket':
        if (!formData.phoneNumber || !/^(?:\+88|01)?(?:\d{11}|\d{13})$/.test(formData.phoneNumber)) {
          setError('Please enter a valid Bangladeshi phone number');
          return false;
        }
        break;
      
      case 'bank_transfer':
        if (!formData.transactionId) {
          setError('Please enter transaction ID');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/purchase-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          courseId: course.id,
          paymentMethod: formData.paymentMethod,
          paymentDetails: formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(data.transaction.id);
        onClose();
      } else {
        setError(data.message || 'Payment failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Complete Purchase
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Course Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex gap-3">
              <img 
                src={course.thumbnail} 
                alt={course.title}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{course.title}</h3>
                <p className="text-xs text-gray-600">by {course.instructor}</p>
                <p className="text-lg font-bold text-green-600 mt-1">
                  ৳{course.price.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Method Selection */}
            <div>
              <Label className="text-sm font-medium">Payment Method</Label>
              <RadioGroup 
                value={formData.paymentMethod} 
                onValueChange={handlePaymentMethodChange}
                className="mt-2"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <Label htmlFor="credit_card" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm">Credit Card</span>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="debit_card" id="debit_card" />
                    <Label htmlFor="debit_card" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-sm">Debit Card</span>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="nagad" id="nagad" />
                    <Label htmlFor="nagad" className="flex items-center gap-2 cursor-pointer">
                      <Smartphone className="w-4 h-4" />
                      <span className="text-sm">Nagad</span>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="bikash" id="bikash" />
                    <Label htmlFor="bikash" className="flex items-center gap-2 cursor-pointer">
                      <Smartphone className="w-4 h-4" />
                      <span className="text-sm">bKash</span>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="rocket" id="rocket" />
                    <Label htmlFor="rocket" className="flex items-center gap-2 cursor-pointer">
                      <Smartphone className="w-4 h-4" />
                      <span className="text-sm">Rocket</span>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <Label htmlFor="bank_transfer" className="flex items-center gap-2 cursor-pointer">
                      <Building className="w-4 h-4" />
                      <span className="text-sm">Bank Transfer</span>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Card Payment Fields */}
            {(formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'debit_card') && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber || ''}
                    onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cardHolder">Card Holder Name</Label>
                  <Input
                    id="cardHolder"
                    placeholder="John Doe"
                    value={formData.cardHolder || ''}
                    onChange={(e) => handleInputChange('cardHolder', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate || ''}
                      onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                      maxLength={5}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={formData.cvv || ''}
                      onChange={(e) => handleInputChange('cvv', e.target.value.replace(/[^0-9]/g, ''))}
                      maxLength={3}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Banking Fields */}
            {(formData.paymentMethod === 'nagad' || formData.paymentMethod === 'bikash' || formData.paymentMethod === 'rocket') && (
              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="01XXXXXXXXX"
                  value={formData.phoneNumber || ''}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your {formData.paymentMethod.charAt(0).toUpperCase() + formData.paymentMethod.slice(1)} account number
                </p>
              </div>
            )}

            {/* Bank Transfer Fields */}
            {formData.paymentMethod === 'bank_transfer' && (
              <div>
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input
                  id="transactionId"
                  placeholder="Enter bank transaction ID"
                  value={formData.transactionId || ''}
                  onChange={(e) => handleInputChange('transactionId', e.target.value)}
                  className="mt-1"
                />
                <div className="mt-2 p-3 bg-blue-50 rounded text-xs text-blue-800">
                  <p className="font-medium mb-1">Bank Transfer Instructions:</p>
                  <p>Transfer ৳{course.price.toLocaleString()} to:</p>
                  <p>Bank: [Bank Name]</p>
                  <p>Account: [Account Number]</p>
                  <p>Then enter the transaction ID above.</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ৳${course.price.toLocaleString()}`
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
