import {isValidPhone} from './validation.js';

Match.phone = Match.Where(phoneNumber => {
  return isValidPhone(phoneNumber); 
});