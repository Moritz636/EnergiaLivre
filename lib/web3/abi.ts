/**
 * lib/web3/abi.ts
 * ABI minima do token ERC-20 (ERC20 + Burnable + Pausable + Permit + Votes + AccessControl)
 *
 * Apenas as funcoes que o backend precisa. Mantem o bundle pequeno.
 */

export const KWATT_MINIMAL_ABI = [
  // ── ERC-20 metadata
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',

  // ── ERC-20 balance
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',

  // ── ERC-20 mutations
  'function transfer(address to, uint256 value) returns (bool)',
  'function approve(address spender, uint256 value) returns (bool)',
  'function transferFrom(address from, address to, uint256 value) returns (bool)',

  // ── Burnable
  'function burn(uint256 value)',
  'function burnFrom(address account, uint256 value)',

  // ── Pausable
  'function paused() view returns (bool)',

  // ── Permit (EIP-2612)
  'function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)',
  'function nonces(address owner) view returns (uint256)',
  'function DOMAIN_SEPARATOR() view returns (bytes32)',

  // ── Votes (EIP-5805)
  'function getVotes(address account) view returns (uint256)',
  'function delegates(address account) view returns (address)',

  // ── AccessControl
  'function hasRole(bytes32 role, address account) view returns (bool)',
  'function MINTER_ROLE() view returns (bytes32)',
  'function PAUSER_ROLE() view returns (bytes32)',

  // ── Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  'event TokensMinted(address indexed to, uint256 amount, address indexed by)',
  'event TokensBurned(address indexed from, uint256 amount)',
] as const;

export const ERC20_TRANSFER_EVENT_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
