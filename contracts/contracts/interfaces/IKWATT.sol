// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title IKWATT — Interface pública do token utilitário KWATT
/// @notice EnergiaLivre — Lei 14.478/2022 (token utilitário, não-security)
/// @dev Esta interface é estável. Implementações podem adicionar funções
///      desde que não quebrem compatibilidade com a interface aqui declarada.
interface IKWATT {
    // ─── ERC-20 padrão ─────────────────────────────────────────────
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);

    // ─── ERC-20 Burnable ───────────────────────────────────────────
    function burn(uint256 value) external;
    function burnFrom(address account, uint256 value) external;

    // ─── ERC-20 Permit (EIP-2612) ──────────────────────────────────
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
    function nonces(address owner) external view returns (uint256);
    function DOMAIN_SEPARATOR() external view returns (bytes32);

    // ─── ERC-20 Pausable ───────────────────────────────────────────
    function paused() external view returns (bool);
    function pause() external;
    function unpause() external;

    // ─── ERC-20 Votes (EIP-5805 + EIP-6372) ────────────────────────
    function getVotes(address account) external view returns (uint256);
    function getPastVotes(address account, uint256 timepoint) external view returns (uint256);
    function getPastTotalSupply(uint256 timepoint) external view returns (uint256);
    function delegates(address account) external view returns (address);
    function delegate(address delegatee) external;
    function delegateBySig(
        address delegatee,
        uint256 nonce,
        uint256 expiry,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    // ─── AccessControl ─────────────────────────────────────────────
    function hasRole(bytes32 role, address account) external view returns (bool);
    function getRoleAdmin(bytes32 role) external view returns (bytes32);
    function grantRole(bytes32 role, address account) external;
    function revokeRole(bytes32 role, address account) external;
    function renounceRole(bytes32 role, address account) external;

    // ─── Minter role (específico KWATT) ────────────────────────────
    function MINTER_ROLE() external view returns (bytes32);

    // ─── Metadata ──────────────────────────────────────────────────
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}
