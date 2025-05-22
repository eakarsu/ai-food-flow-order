
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PhoneNumberInputProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
}

const PhoneNumberInput = ({ phoneNumber, setPhoneNumber }: PhoneNumberInputProps) => {
  const [inputPhoneNumber, setInputPhoneNumber] = useState(phoneNumber || "+18001234567");
  
  // When component mounts, initialize with a valid default if empty
  useEffect(() => {
    console.log("PhoneNumberInput: Component mounted with phone:", inputPhoneNumber);
    
    // If no phone number is set, use the default
    if (!inputPhoneNumber || inputPhoneNumber.trim() === "") {
      console.log("PhoneNumberInput: Using default phone number");
      const defaultPhone = "+18001234567";
      setInputPhoneNumber(defaultPhone);
      setPhoneNumber(defaultPhone);
      localStorage.setItem('lastPhoneNumber', defaultPhone);
    }
  }, []);

  // When parent component updates phoneNumber
  useEffect(() => {
    if (phoneNumber && phoneNumber !== inputPhoneNumber) {
      console.log("PhoneNumberInput: Parent updated phone to:", phoneNumber);
      setInputPhoneNumber(phoneNumber);
    }
  }, [phoneNumber]);

  const handleChangePhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("PhoneNumberInput: Phone input changed to:", newValue);
    
    // Always update local state first
    setInputPhoneNumber(newValue);
    
    // Then update parent and localStorage
    if (newValue && newValue.trim() !== "") {
      console.log("PhoneNumberInput: Updating parent with new phone:", newValue);
      setPhoneNumber(newValue);
      localStorage.setItem('lastPhoneNumber', newValue);
    } else {
      // If empty, use default
      const defaultPhone = "+18001234567";
      console.log("PhoneNumberInput: Empty input, using default:", defaultPhone);
      setPhoneNumber(defaultPhone);
      localStorage.setItem('lastPhoneNumber', defaultPhone);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="phone-sms">Customer Phone Number</Label>
      <Input 
        id="phone-sms"
        type="tel" 
        placeholder="+1 (555) 123-4567" 
        value={inputPhoneNumber}
        onChange={handleChangePhoneNumber}
      />
      <div className="text-xs text-muted-foreground">
        Using phone number: {inputPhoneNumber || "+18001234567"}
      </div>
    </div>
  );
};

export default PhoneNumberInput;
