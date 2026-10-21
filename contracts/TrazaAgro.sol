// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;


contract TrazaAgro {
    enum Estado { REGISTRADO, TRANSPORTADO, RECIBIDO, RECHAZADO }

    struct LecturaIoT {
        int256 temperatura;
        string fuente;
        uint256 timestamp;
        address operador;
    }

    struct Producto {
        string codigo;
        string descripcion;
        string origen;
        Estado estado;
        uint256 timestamp;
        address responsable;
        bool existe;
        LecturaIoT ultimaLectura;
    }

    address public owner;
    mapping(string => Producto) private productos;
    mapping(address => bool) public esOperador;

    // Eventos del sistema
    event ProductoRegistrado(string indexed codigo, string descripcion, string origen, address responsable);
    event EstadoActualizado(string indexed codigo, Estado estado, address responsable);
    event LecturaIoTRegistrada(string indexed codigo, int256 temperatura, string fuente, address operador);
    event OperadorAsignado(address indexed operador, bool estado);

    // Custom errors para optimización de gas
    error NoAutorizado(address usuario);
    error ProductoYaExiste(string codigo);
    error ProductoInexistente(string codigo);

    constructor() {
        owner = msg.sender;
        esOperador[msg.sender] = true;
    }

    // Modificadores de control de acceso
    modifier onlyOwner() {
        if (msg.sender != owner) revert NoAutorizado(msg.sender);
        _;
    }

    modifier soloAutorizados() {
        if (msg.sender != owner && !esOperador[msg.sender]) revert NoAutorizado(msg.sender);
        _;
    }

    // Gestión de roles (Reto / TC08)
    function asignarOperador(address operador, bool activo) external onlyOwner {
        esOperador[operador] = activo;
        emit OperadorAsignado(operador, activo);
    }

    // TC01: Registrar producto / TC02: Reversión por duplicado
    function registrarProducto(
        string calldata codigo,
        string calldata descripcion,
        string calldata origen
    ) external soloAutorizados {
        if (productos[codigo].existe) revert ProductoYaExiste(codigo);

        productos[codigo].codigo = codigo;
        productos[codigo].descripcion = descripcion;
        productos[codigo].origen = origen;
        productos[codigo].estado = Estado.REGISTRADO;
        productos[codigo].timestamp = block.timestamp;
        productos[codigo].responsable = msg.sender;
        productos[codigo].existe = true;

        emit ProductoRegistrado(codigo, descripcion, origen, msg.sender);
    }

    // TC04: Actualizar estado / TC06: Producto inexistente / TC08: Cuenta no autorizada
    function actualizarEstado(
        string calldata codigo,
        Estado nuevoEstado
    ) external soloAutorizados {
        if (!productos[codigo].existe) revert ProductoInexistente(codigo);

        productos[codigo].estado = nuevoEstado;
        productos[codigo].timestamp = block.timestamp;
        productos[codigo].responsable = msg.sender;

        emit EstadoActualizado(codigo, nuevoEstado, msg.sender);
    }

    // TC07: Registrar dato IoT (Sensor / Temperatura)
    function registrarDatoIoT(
        string calldata codigo,
        int256 temperatura,
        string calldata fuente
    ) external soloAutorizados {
        if (!productos[codigo].existe) revert ProductoInexistente(codigo);

        LecturaIoT memory lectura = LecturaIoT({
            temperatura: temperatura,
            fuente: fuente,
            timestamp: block.timestamp,
            operador: msg.sender
        });

        productos[codigo].ultimaLectura = lectura;

        emit LecturaIoTRegistrada(codigo, temperatura, fuente, msg.sender);
    }

    // TC03: Consultar producto / TC05: Reversión por inexistente
    function consultarProducto(string calldata codigo) external view returns (Producto memory) {
        if (!productos[codigo].existe) revert ProductoInexistente(codigo);
        return productos[codigo];
    }
}