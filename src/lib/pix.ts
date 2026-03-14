function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function crc16(payload: string): string {
  const polynomial = 0x1021;
  let result = 0xffff;
  const bytes = new TextEncoder().encode(payload);
  for (const byte of bytes) {
    result ^= byte << 8;
    for (let i = 0; i < 8; i++) {
      if (result & 0x8000) {
        result = ((result << 1) ^ polynomial) & 0xffff;
      } else {
        result = (result << 1) & 0xffff;
      }
    }
  }
  return result.toString(16).toUpperCase().padStart(4, "0");
}

export function generatePixPayload(options: {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  txId?: string;
}): string {
  const { pixKey, merchantName, merchantCity, amount, txId } = options;

  const gui = tlv("00", "br.gov.bcb.pix");
  const key = tlv("01", pixKey);
  const merchantAccountInfo = tlv("26", gui + key);

  let payload = "";
  payload += tlv("00", "01");
  payload += merchantAccountInfo;
  payload += tlv("52", "0000");
  payload += tlv("53", "986");

  if (amount && amount > 0) {
    payload += tlv("54", amount.toFixed(2));
  }

  payload += tlv("58", "BR");
  payload += tlv("59", merchantName.substring(0, 25));
  payload += tlv("60", merchantCity.substring(0, 15));

  const additionalData = tlv("05", (txId || "***").substring(0, 25));
  payload += tlv("62", additionalData);

  payload += "6304";
  const checksum = crc16(payload);
  payload += checksum;

  return payload;
}
