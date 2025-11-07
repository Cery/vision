const rateLimitStore = {};

const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5;

function isRateLimited(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  const requests = (rateLimitStore[ip] || []).filter(
    (timestamp) => timestamp > windowStart
  );

  if (requests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  requests.push(now);
  rateLimitStore[ip] = requests;
  return false;
}

function validate(data) {
    const errors = {};
  
    if (!data.RequirementID) {
      errors.RequirementID = 'RequirementID is required';
    }
  
    if (!data.SupplierCompanyName) {
      errors.SupplierCompanyName = 'Company name is required';
    }
  
    if (!data.SupplierContact) {
      errors.SupplierContact = 'Contact name is required';
    }

    if (!data.SupplierPhone) {
        errors.SupplierPhone = 'Phone number is required';
    }
  
    if (data.SupplierEmail && !/\S+@\S+\.\S+/.test(data.SupplierEmail)) {
      errors.SupplierEmail = 'Email address is invalid';
    }
  
    if (!data.Price || isNaN(data.Price) || data.Price <= 0) {
      errors.Price = 'Price must be a positive number';
    }
  
    return errors;
  }

  function validateStatusUpdate(data) {
    const errors = {};
  
    if (!data.quoteId) {
      errors.quoteId = 'quoteId is required';
    }
  
    if (!data.status) {
      errors.status = 'status is required';
    }
  
    return errors;
  }

  function validateDelete(data) {
    const errors = {};
  
    if (!data.quoteId) {
      errors.quoteId = 'quoteId is required';
    }
  
    return errors;
  }

module.exports = { isRateLimited, validate, validateStatusUpdate, validateDelete };