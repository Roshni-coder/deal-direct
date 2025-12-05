import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Format date to Indian format
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-IN', options);
};

// Calculate end date
const calculateEndDate = (startDate, months) => {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + parseInt(months));
  date.setDate(date.getDate() - 1);
  return formatDate(date);
};

// Generate Rental/Lease Agreement
export const generateAgreement = async (req, res) => {
  try {
    const {
      landlordName,
      landlordAge,
      landlordAddress,
      landlordPhone,
      landlordAadhaar,
      tenantName,
      tenantAge,
      tenantAddress,
      tenantPhone,
      tenantAadhaar,
      propertyAddress,
      state,
      city,
      rentAmount,
      securityDeposit,
      maintenanceCharges,
      startDate,
      durationMonths = 11,
      noticePeriod = 1,
      rentDueDay = 5,
      propertyType = "Residential",
      bhkType = "",
      furnishing = "Unfurnished",
      carpetArea = "",
      additionalTerms = "",
    } = req.body;

    // Validate required fields
    if (!landlordName || !tenantName || !propertyAddress || !state || !city || !rentAmount || !securityDeposit || !startDate) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Format dates
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = calculateEndDate(startDate, durationMonths);
    const executionDate = formatDate(new Date());

    // Determine agreement type based on state
    const isMaharashtra = state.toLowerCase() === "maharashtra";
    const agreementType = isMaharashtra ? "LEAVE AND LICENSE AGREEMENT" : "RESIDENTIAL RENTAL AGREEMENT";
    const landlordTitle = isMaharashtra ? "LICENSOR" : "LESSOR/LANDLORD";
    const tenantTitle = isMaharashtra ? "LICENSEE" : "LESSEE/TENANT";
    const actReference = isMaharashtra 
      ? "Maharashtra Rent Control Act, 1999 and the Maharashtra Rent Control Act (Unregistered Lease) Rules, 2017" 
      : `applicable Rent Control Act of ${state}`;

    // Format amounts in words
    const rentInWords = numberToWords(parseInt(rentAmount));
    const depositInWords = numberToWords(parseInt(securityDeposit));
    const maintenanceInWords = maintenanceCharges ? numberToWords(parseInt(maintenanceCharges)) : null;

    const prompt = `
You are an expert Legal Drafter specializing in Indian Real Estate Law. Generate a COMPLETE, PROFESSIONAL ${agreementType} with ALL details filled in. DO NOT use any placeholder text like [Age], [Address], etc. Use the EXACT values provided below.

══════════════════════════════════════════════════════════════════════
                    AGREEMENT DETAILS TO USE
══════════════════════════════════════════════════════════════════════

**AGREEMENT TYPE:** ${agreementType}

**${landlordTitle} (FIRST PARTY):**
- Full Name: ${landlordName}
- Age: ${landlordAge || 'Adult'} years
- Permanent Address: ${landlordAddress || 'As per ID proof'}
- Contact: ${landlordPhone || 'As per records'}
- Aadhaar (Last 4 digits): XXXX-XXXX-${landlordAadhaar || 'XXXX'}

**${tenantTitle} (SECOND PARTY):**
- Full Name: ${tenantName}
- Age: ${tenantAge || 'Adult'} years
- Permanent Address: ${tenantAddress || 'As per ID proof'}
- Contact: ${tenantPhone || 'As per records'}
- Aadhaar (Last 4 digits): XXXX-XXXX-${tenantAadhaar || 'XXXX'}

**PROPERTY DETAILS:**
- Type: ${bhkType ? bhkType + ' ' : ''}${propertyType} Property
- Furnishing Status: ${furnishing}
- Carpet Area: ${carpetArea ? carpetArea + ' sq.ft.' : 'As per actual measurement'}
- Complete Address: ${propertyAddress}, ${city}, ${state}

**FINANCIAL TERMS:**
- Monthly Rent: ₹${parseInt(rentAmount).toLocaleString('en-IN')} (Rupees ${rentInWords} Only)
- Security Deposit: ₹${parseInt(securityDeposit).toLocaleString('en-IN')} (Rupees ${depositInWords} Only)
${maintenanceCharges ? `- Monthly Maintenance: ₹${parseInt(maintenanceCharges).toLocaleString('en-IN')} (Rupees ${maintenanceInWords} Only)` : '- Maintenance: As per society rules, payable separately'}
- Rent Due Date: ${rentDueDay}${rentDueDay === 1 ? 'st' : rentDueDay === 2 ? 'nd' : rentDueDay === 3 ? 'rd' : 'th'} of each calendar month

**AGREEMENT PERIOD:**
- Start Date: ${formattedStartDate}
- End Date: ${formattedEndDate}
- Duration: ${durationMonths} months
- Notice Period: ${noticePeriod} month(s)
- Lock-in Period: ${Math.min(3, parseInt(durationMonths))} months

**EXECUTION DETAILS:**
- Date of Execution: ${executionDate}
- Place of Execution: ${city}, ${state}
- Jurisdiction: Courts at ${city}, ${state}

${additionalTerms ? `**SPECIAL CONDITIONS:** ${additionalTerms}` : ''}

══════════════════════════════════════════════════════════════════════

══════════════════════════════════════════════════════════════════════

**CRITICAL INSTRUCTIONS - READ CAREFULLY:**

1. Use EXACTLY the values provided above. NO placeholders like [Age], [Address], [Name] etc.
2. If a value says "As per ID proof" or similar, keep that exact text - don't add brackets.
3. Format the agreement professionally with proper legal language.
4. All monetary amounts must show both numerals and words.

**DOCUMENT STRUCTURE:**

Start with this disclaimer block:
---
⚠️ **LEGAL DISCLAIMER**

This AI-generated document is for informational purposes only and does not constitute legal advice. Before execution:
• Verify with a qualified legal professional
• Print on appropriate Stamp Paper as per ${state} Stamp Act
• Register as required under the Registration Act, 1908
---

**TITLE:** Center and bold - "${agreementType}"

**PREAMBLE:**
"This ${agreementType} is made and executed on this ${executionDate} at ${city}, ${state}

BETWEEN

**${landlordName}**, aged ${landlordAge || 'Adult'} years, residing at ${landlordAddress || 'address as per ID proof'}, hereinafter referred to as the "${landlordTitle}" (which expression shall unless repugnant to the context or meaning thereof, include his/her heirs, executors, administrators and assigns) of the FIRST PART;

AND

**${tenantName}**, aged ${tenantAge || 'Adult'} years, residing at ${tenantAddress || 'address as per ID proof'}, hereinafter referred to as the "${tenantTitle}" (which expression shall unless repugnant to the context or meaning thereof, include his/her heirs, executors, administrators and assigns) of the SECOND PART."

**Include these sections with COMPLETE content:**

**RECITALS (WHEREAS clauses):**
- The ${landlordTitle} is the lawful owner of the property
- The ${tenantTitle} has approached for ${isMaharashtra ? 'license' : 'tenancy'}
- Both parties agree to terms herein

**CLAUSE 1: PROPERTY DESCRIPTION**
Address: ${propertyAddress}, ${city}, ${state}
Type: ${bhkType ? bhkType + ' ' : ''}${propertyType}
Furnishing: ${furnishing}
${carpetArea ? `Carpet Area: ${carpetArea} sq.ft.` : ''}

**CLAUSE 2: TERM OF ${isMaharashtra ? 'LICENSE' : 'TENANCY'}**
- Commencement: ${formattedStartDate}
- Expiry: ${formattedEndDate}
- Duration: ${durationMonths} months
- Lock-in Period: ${Math.min(3, parseInt(durationMonths))} months

**CLAUSE 3: ${isMaharashtra ? 'LICENSE FEE' : 'RENT'}**
- Monthly Amount: ₹${parseInt(rentAmount).toLocaleString('en-IN')} (Rupees ${rentInWords} Only)
- Due Date: ${rentDueDay}${rentDueDay === 1 ? 'st' : rentDueDay === 2 ? 'nd' : rentDueDay === 3 ? 'rd' : 'th'} of each month
- Payment Mode: Bank Transfer/UPI/Cheque
- Late Fee: ₹100 per day after 7 days grace period

**CLAUSE 4: SECURITY DEPOSIT**
- Amount: ₹${parseInt(securityDeposit).toLocaleString('en-IN')} (Rupees ${depositInWords} Only)
- Nature: Non-interest bearing, refundable
- Refund: Within 30 days of vacating, after deductions if any

**CLAUSE 5: MAINTENANCE**
${maintenanceCharges ? `- Fixed Maintenance: ₹${parseInt(maintenanceCharges).toLocaleString('en-IN')}/month` : '- As per society charges, payable by ' + tenantTitle}
- Minor repairs (up to ₹2,000): ${tenantTitle}'s responsibility
- Major/structural repairs: ${landlordTitle}'s responsibility

**CLAUSE 6: UTILITIES**
- Electricity, Water, Gas: ${tenantTitle}'s responsibility
- Property Tax: ${landlordTitle}'s responsibility

**CLAUSE 7: USE OF PREMISES**
- Strictly for ${propertyType.toLowerCase()} purpose
- No subletting without written consent
- No illegal activities

**CLAUSE 8: TERMINATION**
- Notice Period: ${noticePeriod} month(s) by either party
- Immediate termination grounds listed

**CLAUSE 9: INSPECTION**
- ${landlordTitle} may inspect with 24-hour notice

**CLAUSE 10: DISPUTE RESOLUTION**
- Amicable settlement first
- Arbitration under Arbitration Act, 1996
- Jurisdiction: Courts at ${city}, ${state}

**CLAUSE 11: GENERAL PROVISIONS**
- Entire Agreement
- Amendments in writing only
- Governing Law: Laws of India, ${actReference}

${additionalTerms ? `**CLAUSE 12: SPECIAL CONDITIONS**\n${additionalTerms}` : ''}

${furnishing !== 'Unfurnished' ? `**SCHEDULE OF FIXTURES:**
(To be prepared jointly at handover - standard items for ${furnishing} property)` : ''}

**SIGNATURES:**

IN WITNESS WHEREOF, the parties have executed this agreement on the date first mentioned above.

**FOR ${landlordTitle.toUpperCase()}:**

_________________________________
Name: ${landlordName}
Date: ${executionDate}
Place: ${city}

**FOR ${tenantTitle.toUpperCase()}:**

_________________________________
Name: ${tenantName}
Date: ${executionDate}
Place: ${city}

**WITNESSES:**

1. _________________________________
   Name: ___________________
   Address: ___________________

2. _________________________________
   Name: ___________________
   Address: ___________________

---
📋 **IMPORTANT NOTES FOR ${state.toUpperCase()}:**

**Stamp Duty:** Contact local Sub-Registrar for exact stamp duty calculation based on rent + deposit.

**Registration:** ${parseInt(durationMonths) > 11 ? '⚠️ MANDATORY - Agreement exceeds 11 months.' : 'Recommended but not mandatory for 11-month agreement.'}

**Documents Required:**
• Original agreement on stamp paper
• ID proof (Aadhaar/PAN/Passport)
• Address proof
• Passport photos
• Property ownership documents
---

Now generate this COMPLETE agreement using ONLY the provided values. NO PLACEHOLDERS.
`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const agreementText = response.text();

    console.log("Agreement generated successfully for:", {
      landlord: landlordName,
      tenant: tenantName,
      state,
      type: agreementType,
    });

    res.json({
      success: true,
      agreement: agreementText,
      metadata: {
        agreementType,
        state,
        city,
        generatedAt: new Date().toISOString(),
        landlord: {
          name: landlordName,
          age: landlordAge,
          address: landlordAddress,
          phone: landlordPhone,
        },
        tenant: {
          name: tenantName,
          age: tenantAge,
          address: tenantAddress,
          phone: tenantPhone,
        },
        property: {
          address: propertyAddress,
          type: propertyType,
          bhkType,
          furnishing,
          carpetArea,
        },
        financial: {
          rent: rentAmount,
          rentFormatted: `₹${parseInt(rentAmount).toLocaleString('en-IN')}`,
          deposit: securityDeposit,
          depositFormatted: `₹${parseInt(securityDeposit).toLocaleString('en-IN')}`,
          maintenance: maintenanceCharges || null,
          rentDueDay,
        },
        duration: `${durationMonths} months`,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        noticePeriod: `${noticePeriod} month(s)`,
        lockInPeriod: `${Math.min(3, parseInt(durationMonths))} months`,
      },
    });
  } catch (error) {
    console.error("Agreement generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate agreement",
      error: error.message,
    });
  }
};

// Convert number to words (Indian format)
function numberToWords(num) {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function convertLessThanThousand(n) {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
  }
  
  if (num < 1000) return convertLessThanThousand(num);
  if (num < 100000) {
    return convertLessThanThousand(Math.floor(num / 1000)) + ' Thousand' + 
      (num % 1000 ? ' ' + convertLessThanThousand(num % 1000) : '');
  }
  if (num < 10000000) {
    return convertLessThanThousand(Math.floor(num / 100000)) + ' Lakh' + 
      (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
  }
  return convertLessThanThousand(Math.floor(num / 10000000)) + ' Crore' + 
    (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
}

// Get agreement templates info
export const getAgreementTemplates = async (req, res) => {
  try {
    const templates = [
      {
        id: "residential-rent",
        title: "Residential Rental Agreement",
        description: "Standard rental agreement for residential properties",
        states: ["All States except Maharashtra"],
        duration: "11 months (default)",
      },
      {
        id: "maharashtra-leave-license",
        title: "Leave and License Agreement",
        description: "Mandatory format for Maharashtra state",
        states: ["Maharashtra"],
        duration: "11 months (default)",
      },
      {
        id: "commercial-rent",
        title: "Commercial Rental Agreement",
        description: "For commercial properties like shops, offices",
        states: ["All States"],
        duration: "11-36 months",
      },
    ];

    res.json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error("Get templates error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch templates",
    });
  }
};

// Indian states list for dropdown
export const getIndianStates = async (req, res) => {
  try {
    const states = [
      "Andhra Pradesh",
      "Arunachal Pradesh",
      "Assam",
      "Bihar",
      "Chhattisgarh",
      "Goa",
      "Gujarat",
      "Haryana",
      "Himachal Pradesh",
      "Jharkhand",
      "Karnataka",
      "Kerala",
      "Madhya Pradesh",
      "Maharashtra",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Odisha",
      "Punjab",
      "Rajasthan",
      "Sikkim",
      "Tamil Nadu",
      "Telangana",
      "Tripura",
      "Uttar Pradesh",
      "Uttarakhand",
      "West Bengal",
      "Delhi",
      "Chandigarh",
      "Puducherry",
    ];

    res.json({
      success: true,
      states,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch states",
    });
  }
};
