
/**
 * Utility functions for phone number formatting and validation
 */

/**
 * Format a phone number to E.164 format (e.g., +18001234567)
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone || phone.trim() === "") {
    return "+18001234567"; // Default fallback
  }
  
  try {
    console.log("Original phone input:", phone);
    
    // First remove any quotes that might be causing the syntax error
    let formatted = phone.toString().replace(/['"]+/g, '').trim();
    console.log("After removing quotes:", formatted);
    
    // Extract only the digits and any leading plus sign
    const hasPlus = formatted.startsWith('+');
    const digitsOnly = formatted.replace(/\D/g, '');
    console.log("Digits only:", digitsOnly);
    
    // Ensure we have digits
    if (!digitsOnly || digitsOnly.length === 0) {
      console.log("No digits found, using default");
      return "+18001234567";
    }
    
    // Construct proper E.164: + followed by digits
    formatted = (hasPlus ? "+" : "+") + digitsOnly;
    console.log("Final E.164 format:", formatted);
    
    // Sanity check: Must start with + and have at least one digit
    if (!formatted.startsWith('+') || formatted.length < 2) {
      console.log("Invalid format after processing, using default");
      return "+18001234567";
    }
    
    return formatted;
  } catch (error) {
    console.error("Error formatting phone number:", error);
    return "+18001234567"; // Default on error
  }
};
