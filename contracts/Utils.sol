pragma solidity ^0.4.23;

library Utils {
  function bytes32ToString(bytes32 x) public pure returns (string) {
      bytes memory bytesString = new bytes(32);
      uint charCount = 0;
      for (uint j = 0; j < 32; j++) {
          byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
          if (char != 0) {
              bytesString[charCount] = char;
              charCount++;
          }
      }
      bytes memory bytesStringTrimmed = new bytes(charCount);
      for (j = 0; j < charCount; j++) {
          bytesStringTrimmed[j] = bytesString[j];
      }
      return string(bytesStringTrimmed);
  }

  function uintToString(uint v) public pure returns (string str) {
    uint maxlength = 100;
    bytes memory reversed = new bytes(maxlength);
    uint i = 0;
    while (v != 0) {
        uint remainder = v % 10;
        v = v / 10;
        reversed[i++] = byte(48 + remainder);
    }
    bytes memory s = new bytes(i);
    for (uint j = 0; j < i; j++) {
        s[j] = reversed[i - 1 - j];
    }
    str = string(s);
  }
}
