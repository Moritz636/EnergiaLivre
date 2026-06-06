// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title KWATT (template)
 * @notice Token utilitário do EnergiaLivre.
 *         1 KWATT = 30% de 1 kWh compensado (R$ 0,285 base em 06/2026).
 *         Conforme Lei 14.478/2022 (Marco Legal Cripto) — NÃO é security.
 * @dev    Esta é uma REFERÊNCIA didática. O contrato final será gerado
 *         via Thirdweb OU OpenZeppelin Wizard, revisado e preenchido aqui
 *         antes da auditoria interna.
 *
 *         Não usar este arquivo em produção sem auditoria.
 */
contract KWATT is
    ERC20,
    ERC20Burnable,
    ERC20Pausable,
    ERC20Permit,
    ERC20Votes,
    AccessControl
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    /// @dev Limite absoluto de supply — guard contra bugs de mint
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18; // 1 bilhão

    /// @dev Emissões pré-definidas para o genesis (ajustar conforme tokenomics)
    uint256 public immutable initialSupply;

    event TokensMinted(address indexed to, uint256 amount, address indexed by);
    event TokensBurned(address indexed from, uint256 amount);

    error MaxSupplyExceeded(uint256 requested, uint256 cap);
    error ZeroAddress();
    error ZeroAmount();

    constructor(
        address initialOwner,
        address minter,
        uint256 _initialSupply
    )
        ERC20("KWATT", "KWATT")
        ERC20Permit("KWATT")
    {
        if (initialOwner == address(0) || minter == address(0)) revert ZeroAddress();
        if (_initialSupply > MAX_SUPPLY) revert MaxSupplyExceeded(_initialSupply, MAX_SUPPLY);

        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(MINTER_ROLE, minter);
        _grantRole(PAUSER_ROLE, initialOwner);

        initialSupply = _initialSupply;
        if (_initialSupply > 0) {
            _mint(initialOwner, _initialSupply);
        }
    }

    /// @notice Mint de novos tokens (uso restrito a platform com MINTER_ROLE)
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        if (totalSupply() + amount > MAX_SUPPLY) {
            revert MaxSupplyExceeded(totalSupply() + amount, MAX_SUPPLY);
        }
        _mint(to, amount);
        emit TokensMinted(to, amount, _msgSender());
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    // ─── Hooks ─────────────────────────────────────────────────────
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        // Para versão UUPS futura. Atualmente não usado.
        newImplementation;
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, IERC5267)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
