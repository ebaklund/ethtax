'use strict';

const _addressString = new WeakMap();

class EthereumAddress {
  static isValidAddressString (addressString) {
    return t.string().accepts(addressString) && /0x[a-fA-F0-9]{20}/.test(addressString);
  }

  constructor (addressString) {
    if (isValidAddressString(addressString))
      throw TypeError('address argument is not a valid address string');

    _addressString.set(this, addressString.toLowerCase());
  }

  get addressString () {
    return _addressString.get(this);
  }

  static from (addressString) {
    return isValidAddressString(addressString)
      ? new EthereumAddress(addressString)
      : null;
  }

  eq (that) {
    t.class(EthereumAddress).assert(that);
    return this.addressString === that.addressString;
  }

  static eq (address1, address2) {
    const addr1 = t.class(EthereumAddress).accepts(address1)
      ? address1
      : EthereumAddress.from(address1);

    assert(addr1, 'address1 must represent an ethereum address.');

    const addr2 = t.class(EthereumAddress).accepts(address2)
      ? address2
      : EthereumAddress.from(address2);

    assert(addr2, 'address2 must represent an ethereum address.');

    const res = (addr1 && addr2 && addr1.eq(addr2));

    return res;
  }
}

module.exports = EthereumAddress;
