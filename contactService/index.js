// Start your code here!
// You should not need to edit any other existing files (other than if you would like to add tests)
// You do not need to import anything as all the necessary data and events will be delivered through
// updates and service, the 2 arguments to the constructor
// Feel free to add files as necessary

export default class {
  constructor(updates, service) {
    this.listOfContacts = []
    updates.on('add', (id) => this.handleAdd(id, service));
    updates.on('change', (id, fieldToChange, valueOfChange) => this.handleChange(id, fieldToChange, valueOfChange))
    updates.on('remove', (id) =>  this.handleRemove(id));
  }

  handleAdd(id, service) {
    service.getById(id).then(result => this.listOfContacts.push(result))
  }

  handleChange(id, fieldToChange, valueOfChange) {
    let contactToChange = this.listOfContacts.find((element) => element.id == id);
    contactToChange[fieldToChange] = valueOfChange;
  }

  handleRemove(id) {
    this.listOfContacts = this.listOfContacts.filter((element) => element.id !== id)
  }

  search(query) {
    let meetsCriteria = []
    this.listOfContacts.forEach(element => {
      if (this.searchNames(element.firstName, element.nickName, element.lastName, query)) {
        meetsCriteria.push(element)
      } else if (this.searchPhoneNumber(element.primaryPhoneNumber, element.secondaryPhoneNumber, query)) {
        meetsCriteria.push(element)
      } else if (this.searchEmail(element.primaryEmail, element.secondaryEmail, query)) {
        meetsCriteria.push(element)
      }
    });
    return this.formatData(meetsCriteria);
  }

  // Email search
  searchEmail(primary, secondary, query) {
    let emails = [primary, secondary]
    let searchResult =  emails.filter((element) => { return element.includes(query) })
    if(searchResult.length > 0) return 1; else return 0;
  }

  // Phone number search
  searchPhoneNumber(primaryPhoneNumber, secondaryPhoneNumber, query) {
    let phoneNumbers = [primaryPhoneNumber, secondaryPhoneNumber, this.phoneSanitize(primaryPhoneNumber), this.phoneSanitize(secondaryPhoneNumber)]
    let phoneNumbersFormatted = this.formatPhones(primaryPhoneNumber, secondaryPhoneNumber);
    let combinedPhones = phoneNumbers.concat(phoneNumbersFormatted); 
    let searchResult =  combinedPhones.filter((element) => { return element.includes(query) })
    if(searchResult.length > 0) return 1; else return 0;
  }

  // Name search
  searchNames(firstName, nickName, lastName, query) {
    let searchResults = false;
    // Split up for spaces if searching first and last name
    let queryItems = query.split(' ')
    queryItems.forEach(element => {
      if (firstName.includes(element)) { searchResults = true; return; }
      else if (lastName.includes(element)) { searchResults = true; return; }
      else if (nickName !== '' && nickName.includes(element)) { searchResults = true; return; }
    });
    return searchResults;
  }
  
  // Formatting data
  formatData(data) {
    let formated = []
    data.forEach(element => {
      formated.push(
        {
          id: element.id,
          name: this.formatName(element.firstName, element.nickName, element.lastName),
          email: this.formatEmail(element.primaryEmail, element.secondaryEmail),
          phones: this.formatPhones(element.primaryPhoneNumber, element.secondaryPhoneNumber),
          address: this.formatAddress(element.addressLine1, element.addressLine2, element.addressLine3, element.city, element.state, element.zipCode),
        }
      )
    });
    return formated;
  }

  // formatAddress - Formatting address for final output
  formatAddress(addressLine1, addressLine2, addressLine3, city, state, zipCode) {
    let address = ''
    let addressArray = [addressLine1, addressLine2, addressLine3, city, state, zipCode]
    addressArray.forEach(element => {
      if(element) {
        if (address.length > 0) {
          address = address + " " + element;
        } else {
          address = address + element;
        } 
      }
    });
    return address;
  }

  // formatName - Formatting name for final output
  formatName(firstName, nickName, lastName) {
    if (nickName !== '') return [nickName, lastName].join(' ');
    else return [firstName, lastName].join(' ');
  }

  // formatEmail - Formatting email for final output
  formatEmail(primaryEmail, secondaryEmail) {
    return primaryEmail || secondaryEmail
  }

  // formatPhones - Formatting phones for final output.
  formatPhones(primary, secondary) {
    let phones = [primary, secondary]
    let phoneArray = []
    phones.forEach(element => {
      if (element !== '' && element !== null) {
        let sanitizedNumber = this.phoneSanitize(element);
        if (sanitizedNumber.length === 10) {
          phoneArray.push("(" + sanitizedNumber.substring(0, 3) + ") " + sanitizedNumber.substring(3, 6) + "-" + sanitizedNumber.substring(6, 10) )
        }
      }
    });
   return phoneArray
  }

  // phoneSanitize - Removes special characters and returns only numbers for proper formatting
  phoneSanitize(number) {
    return number.replace(/-/g, '').replace(/\+1/g, '');
  }
}