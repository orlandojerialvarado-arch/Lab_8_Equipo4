let provider;
let signer;
let contract;
let userAddress = null;

const ESTADOS = ["REGISTRADO", "TRANSPORTADO", "RECIBIDO", "RECHAZADO"];

function setStatus(msg, isError = false) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.style.borderLeftColor = isError ? "#ef4444" : "#059669";
  el.style.backgroundColor = isError ? "#fef2f2" : "#f0fdf4";
}

async function conectarBilletera() {
  if (!window.ethereum) {
    alert("MetaMask no detectado. Instale la extensión de MetaMask en su navegador.");
    return;
  }

  try {
    setStatus("Conectando con MetaMask...");
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();
    const network = await provider.getNetwork();

    document.getElementById("wallet").innerHTML = `<strong>Billetera:</strong> <span class="mono">${userAddress}</span>`;
    document.getElementById("network").innerHTML = `<strong>Red:</strong> Chain ID ${network.chainId}`;

    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    try {
      const ownerAddress = await contract.owner();
      const isOp = await contract.esOperador(userAddress);

      let rolTexto = "Usuario Estándar";
      if (userAddress.toLowerCase() === ownerAddress.toLowerCase()) {
        rolTexto = "👑 Owner / Administrador";
      } else if (isOp) {
        rolTexto = "⚙️ Operador Autorizado";
      }
      document.getElementById("role").innerHTML = `<strong>Rol:</strong> ${rolTexto}`;
    } catch (e) {
      document.getElementById("role").innerHTML = `<strong>Rol:</strong> Contrato no verificado en esta dirección`;
    }

    setStatus("Billetera conectada correctamente.");
  } catch (error) {
    console.error(error);
    setStatus("Error al conectar: " + (error.shortMessage || error.message), true);
  }
}

async function asegurarConexion() {
  if (!contract || !signer) {
    await conectarBilletera();
  }
}

async function registrarProducto() {
  try {
    await asegurarConexion();
    const codigo = document.getElementById("codigoReg").value.trim();
    const desc = document.getElementById("descripcionReg").value.trim();
    const origen = document.getElementById("origenReg").value.trim();

    if (!codigo || !desc || !origen) {
      alert("Complete todos los campos del producto.");
      return;
    }

    setStatus(`Firmando transacción para registrar ${codigo}...`);
    const tx = await contract.registrarProducto(codigo, desc, origen);
    setStatus(`Transacción enviada: ${tx.hash}. Esperando confirmación de bloque...`);
    await tx.wait();
    setStatus(`✅ Producto ${codigo} registrado con éxito en la blockchain.`);
  } catch (error) {
    console.error(error);
    setStatus(`❌ Error al registrar: ${error.reason || error.shortMessage || error.message}`, true);
  }
}

async function actualizarEstado() {
  try {
    await asegurarConexion();
    const codigo = document.getElementById("codigoEstado").value.trim();
    const estado = Number(document.getElementById("selectEstado").value);

    if (!codigo) {
      alert("Ingrese el código del producto.");
      return;
    }

    setStatus(`Firmando cambio de estado para ${codigo}...`);
    const tx = await contract.actualizarEstado(codigo, estado);
    setStatus(`Transacción enviada: ${tx.hash}. Minando bloque...`);
    await tx.wait();
    setStatus(`✅ Estado de ${codigo} actualizado a ${ESTADOS[estado]}.`);
  } catch (error) {
    console.error(error);
    setStatus(`❌ Error al actualizar estado: ${error.reason || error.shortMessage || error.message}`, true);
  }
}

async function registrarIoT() {
  try {
    await asegurarConexion();
    const codigo = document.getElementById("codigoIoT").value.trim();
    const tempRaw = document.getElementById("tempIoT").value;
    const fuente = document.getElementById("fuenteIoT").value.trim();

    if (!codigo || !tempRaw || !fuente) {
      alert("Complete todos los campos del sensor IoT.");
      return;
    }

    const tempParsed = Math.round(parseFloat(tempRaw) * 10);

    setStatus(`Enviando lectura IoT para producto ${codigo}...`);
    const tx = await contract.registrarDatoIoT(codigo, tempParsed, fuente);
    setStatus(`Transacción enviada: ${tx.hash}. Confirmando...`);
    await tx.wait();
    setStatus(`✅ Telemetría registrada (${tempRaw} °C) por fuente ${fuente}.`);
  } catch (error) {
    console.error(error);
    setStatus(`❌ Error al registrar IoT: ${error.reason || error.shortMessage || error.message}`, true);
  }
}

async function asignarOperador() {
  try {
    await asegurarConexion();
    const op = document.getElementById("operadorAddress").value.trim();
    const activo = document.getElementById("operadorActivo").value === "true";

    if (!op || !ethers.isAddress(op)) {
      alert("Ingrese una dirección Ethereum válida (0x...).");
      return;
    }

    setStatus(`Actualizando permisos para ${op}...`);
    const tx = await contract.asignarOperador(op, activo);
    setStatus(`Transacción enviada: ${tx.hash}...`);
    await tx.wait();
    setStatus(`✅ Permiso actualizado: Operador ${op} = ${activo}.`);
  } catch (error) {
    console.error(error);
    setStatus(`❌ Error en asignación de rol: ${error.reason || error.shortMessage || error.message}`, true);
  }
}

async function consultarProducto() {
  try {
    await asegurarConexion();
    const codigo = document.getElementById("codigoConsulta").value.trim();

    if (!codigo) {
      alert("Ingrese un código a consultar.");
      return;
    }

    setStatus(`Consultando producto ${codigo} (llamada view sin costo de gas)...`);
    const p = await contract.consultarProducto(codigo);

    document.getElementById("resultadoContainer").classList.remove("hidden");
    document.getElementById("resCodigo").textContent = p.codigo;
    document.getElementById("resEstado").textContent = ESTADOS[Number(p.estado)];
    document.getElementById("resDesc").textContent = p.descripcion;
    document.getElementById("resOrigen").textContent = p.origen;
    document.getElementById("resResponsable").textContent = p.responsable;

    const fecha = new Date(Number(p.timestamp) * 1000);
    document.getElementById("resFecha").textContent = fecha.toLocaleString();

    const iot = p.ultimaLectura;
    if (Number(iot.timestamp) === 0) {
      document.getElementById("resTemp").textContent = "Sin lecturas previas";
      document.getElementById("resFuente").textContent = "-";
      document.getElementById("resOpSensor").textContent = "-";
      document.getElementById("resFechaIoT").textContent = "-";
    } else {
      const tempReal = (Number(iot.temperatura) / 10).toFixed(1);
      document.getElementById("resTemp").textContent = `${tempReal} °C`;
      document.getElementById("resFuente").textContent = iot.fuente;
      document.getElementById("resOpSensor").textContent = iot.operador;
      const fechaIoT = new Date(Number(iot.timestamp) * 1000);
      document.getElementById("resFechaIoT").textContent = fechaIoT.toLocaleString();
    }

    setStatus(`✅ Datos de ${codigo} cargados correctamente.`);
  } catch (error) {
    console.error(error);
    document.getElementById("resultadoContainer").classList.add("hidden");
    setStatus(`❌ Error de consulta: ${error.reason || error.shortMessage || error.message}`, true);
  }
}

document.getElementById("btnConnect").onclick = conectarBilletera;
document.getElementById("btnRegistrar").onclick = registrarProducto;
document.getElementById("btnActualizarEstado").onclick = actualizarEstado;
document.getElementById("btnRegistrarIoT").onclick = registrarIoT;
document.getElementById("btnAsignarOperador").onclick = asignarOperador;
document.getElementById("btnConsultar").onclick = consultarProducto;