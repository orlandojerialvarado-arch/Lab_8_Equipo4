// falta reemplazar todavia vuando despliegues TrazaAgro.sol en Remix o Hardhat
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

const CONTRACT_ABI = [
  "function owner() view returns (address)",
  "function esOperador(address) view returns (bool)",
  "function asignarOperador(address operador, bool activo)",
  "function registrarProducto(string codigo, string descripcion, string origen)",
  "function actualizarEstado(string codigo, uint8 nuevoEstado)",
  "function registrarDatoIoT(string codigo, int256 temperatura, string fuente)",
  "function consultarProducto(string codigo) view returns (tuple(string codigo, string descripcion, string origen, uint8 estado, uint256 timestamp, address responsable, bool existe, tuple(int256 temperatura, string fuente, uint256 timestamp, address operador) ultimaLectura))",
  "event ProductoRegistrado(string indexed codigo, string descripcion, string origen, address responsable)",
  "event EstadoActualizado(string indexed codigo, uint8 estado, address responsable)",
  "event LecturaIoTRegistrada(string indexed codigo, int256 temperatura, string fuente, address operador)",
  "event OperadorAsignado(address indexed operador, bool estado)",
  "error NoAutorizado(address usuario)",
  "error ProductoYaExiste(string codigo)",
  "error ProductoInexistente(string codigo)"
];