export const DEMO_USERS = [
  { id: 'usr1', employeeId: 'EMP-7801', name: 'Rajesh K', role: 'Operator', department: 'Back Cover Dept', password: '123', shift: 'Shift A' },
  { id: 'usr2', employeeId: 'EMP-4402', name: 'Suresh V', role: 'Technician', discipline: 'Mechanical Maintenance', department: 'Maintenance', password: '123', shift: 'Shift A' },
  { id: 'usr3', employeeId: 'EMP-3910', name: 'Karthik M', role: 'Technician', discipline: 'Electrical Maintenance', department: 'Maintenance', password: '123', shift: 'Shift A' },
  { id: 'usr4', employeeId: 'EMP-2201', name: 'Vikram R', role: 'Technician', discipline: 'Automation Engineer', department: 'Automation', password: '123', shift: 'Shift A' },
  { id: 'usr5', employeeId: 'EMP-1001', name: 'Dinesh Kumar', role: 'Supervisor', department: 'Back Cover Dept', password: '123', shift: 'Shift A' },
  { id: 'usr6', employeeId: 'EMP-0001', name: 'System Admin', role: 'Admin', department: 'IT / Plant Admin', password: '123', shift: 'General' },
  { id: 'usr7', employeeId: 'EMP-4403', name: 'Ramesh Kumar', role: 'Operator', department: 'Back Cover Dept', password: '123', shift: 'Shift A' },
  { id: 'usr8', employeeId: 'EMP-3911', name: 'Anil Sharma', role: 'Operator', department: 'Back Cover Dept', password: '123', shift: 'Shift A' },
  { id: 'usr9', employeeId: 'EMP-5104', name: 'Priya Nair', role: 'Operator', department: 'Back Cover Dept', password: '123', shift: 'Shift A' },
  { id: 'usr10', employeeId: 'EMP-9999', name: 'Mahesh P', role: 'Technician', discipline: 'Mechanical Maintenance', department: 'Maintenance', password: '123', shift: 'Shift A' }
];

export const MACHINES = [
  // Friction Presses (15 Machines)
  { id: 'M-6036001', name: 'Friction Press 6036001', code: '6036001', location: 'Line 1 - Friction Bay', type: 'Friction Press', status: 'Operational', criticality: 'High' },
  { id: 'M-6036002', name: 'Friction Press 6036002', code: '6036002', location: 'Line 1 - Friction Bay', type: 'Friction Press', status: 'Operational', criticality: 'High' },
  { id: 'M-6036003', name: 'Friction Press 6036003', code: '6036003', location: 'Line 1 - Friction Bay', type: 'Friction Press', status: 'Operational', criticality: 'High' },
  { id: 'M-6036004', name: 'Friction Press 6036004', code: '6036004', location: 'Line 2 - Friction Bay', type: 'Friction Press', status: 'Needs Maintenance', criticality: 'High' },
  { id: 'M-6036005', name: 'Friction Press 6036005', code: '6036005', location: 'Line 2 - Friction Bay', type: 'Friction Press', status: 'Operational', criticality: 'High' },
  { id: 'M-6036006', name: 'Friction Press 6036006', code: '6036006', location: 'Line 2 - Friction Bay', type: 'Friction Press', status: 'Operational', criticality: 'High' },
  { id: 'M-6036007', name: 'Friction Press 6036007', code: '6036007', location: 'Line 3 - Friction Bay', type: 'Friction Press', status: 'Operational', criticality: 'High' },
  { id: 'M-6035002', name: 'Friction Press 6035002', code: '6035002', location: 'Line 3 - Friction Bay', type: 'Friction Press', status: 'Operational', criticality: 'Medium' },
  { id: 'M-6038004', name: 'Friction Press 6038004', code: '6038004', location: 'Line 3 - Friction Bay', type: 'Friction Press', status: 'Operational', criticality: 'High' },
  { id: 'M-6036008', name: 'Friction Press 6036008', code: '6036008', location: 'Line 4 - Friction Bay', type: 'Friction Press', status: 'Operational', criticality: 'High' },
  { id: 'M-6036009', name: 'Friction Press 6036009', code: '6036009', location: 'Line 4 - Friction Bay', type: 'Friction Press', status: 'Operational', criticality: 'High' },
  { id: 'M-6036010', name: 'Friction Press 6036010', code: '6036010', location: 'Line 4 - Friction Bay', type: 'Friction Press', status: 'Operational', criticality: 'High' },
  { id: 'M-6038003', name: 'Friction Press 6038003', code: '6038003', location: 'Line 5 - Friction Bay', type: 'Friction Press', status: 'Needs Maintenance', criticality: 'High' },
  { id: 'M-6035001', name: 'Friction Press 6035001', code: '6035001', location: 'Line 5 - Friction Bay', type: 'Friction Press', status: 'Operational', criticality: 'Medium' },
  { id: 'M-6038005', name: 'Friction Press 6038005', code: '6038005', location: 'Line 5 - Friction Bay', type: 'Friction Press', status: 'Operational', criticality: 'High' },

  // Hydraulic Presses (3 Machines)
  { id: 'M-6050005', name: 'Hydraulic Press 6050005', code: '6050005', location: 'Hydraulic Press Cell 01', type: 'Hydraulic Press', status: 'Needs Maintenance', criticality: 'High' },
  { id: 'M-6050001', name: 'Hydraulic Press 6050001', code: '6050001', location: 'Hydraulic Press Cell 01', type: 'Hydraulic Press', status: 'Operational', criticality: 'High' },
  { id: 'M-6036001-HP', name: 'Hydraulic Press 6036001', code: '6036001-HP', location: 'Hydraulic Press Cell 02', type: 'Hydraulic Press', status: 'Operational', criticality: 'High' },

  // Crank Presses (2 Machines)
  { id: 'M-6049004', name: 'Crank Press 6049004', code: '6049004', location: 'Crank Press Line 01', type: 'Crank Press', status: 'Operational', criticality: 'High' },
  { id: 'M-6049002', name: 'Crank Press 6049002', code: '6049002', location: 'Crank Press Line 01', type: 'Crank Press', status: 'Operational', criticality: 'High' },


];

export const FAULT_CATEGORIES = [
  {
    id: 'mechanical',
    name: 'Mechanical Maintenance',
    department: 'Mechanical Maintenance',
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    faults: [
      { id: 'm1', name: 'TDC Problem', machineType: 'Press Machine', desc: 'Top Dead Center position holding or proximity valve issue' },
      { id: 'm2', name: 'Knockout Ejection Problem', machineType: 'Press Machine', desc: 'Bottom pin part ejection pin sticking or failure' },
      { id: 'm3', name: 'Oil Leakage', machineType: 'Hydraulic Press', desc: 'Hydraulic oil leakage from main cylinder or manifold' },
      { id: 'm4', name: 'Operation Pressure Gauge Fault', machineType: 'Press Machine', desc: 'System pressure gauge erratic or non-functional' },
      { id: 'm5', name: 'Ram Centre Wheel Alignment', machineType: 'Press Machine', desc: 'Ram guide wheel stroke alignment error' },
      { id: 'm6', name: 'Wheel Breakdown', machineType: 'Friction Press', desc: 'Friction wheel mechanical fracture or roller bearing failure' },
      { id: 'm7', name: 'Wheel Not Working', machineType: 'Friction Press', desc: 'Jammed friction wheel assembly or drive slippage' },
      { id: 'm8', name: 'Stock Variation', machineType: 'Press Machine', desc: 'Raw material strip thickness deviation' },
      { id: 'm9', name: 'Flywheel Belt Loose', machineType: 'Friction Press / Crank Press', desc: 'Main drive flywheel belt slippage or tension drop' },
      { id: 'm10', name: 'Machine Vibration', machineType: 'Press Machine', desc: 'Abnormal structural vibration during power stroke' },
      { id: 'm11', name: 'Abnormal Noise', machineType: 'Press Machine', desc: 'Metallic grinding or knocking sound in pump/ram' },
      { id: 'm12', name: 'Conveyor Belt Stuck', machineType: 'Material Handling', desc: 'Main transport belt jammed by debris' },
      { id: 'm13', name: 'Conveyor Belt Jam', machineType: 'Material Handling', desc: 'Roller track mechanical blockage' },
      { id: 'm14', name: 'Bowl Feeder Vibrator Issue', machineType: 'Material Handling', desc: 'Electromagnetic vibrator coil failure' },
      { id: 'm15', name: 'Bowl Feeder Clamp Loose', machineType: 'Material Handling', desc: 'Vibrating bowl mounting clamp loose' },
      { id: 'm16', name: 'Safety Rope Stuck', machineType: 'Safety', desc: 'Emergency trip rope mechanical binding' }
    ]
  },
  {
    id: 'electrical',
    name: 'Electrical Maintenance',
    department: 'Electrical Maintenance',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    faults: [
      { id: 'e1', name: 'Push Button Not Working', desc: 'Start/Stop/Inch push button electrical contact block fault' },
      { id: 'e2', name: 'Push Button Jammed', desc: 'Physical button mechanically stuck in panel' },
      { id: 'e3', name: 'Overload', desc: 'Thermal overload relay tripped on motor starter' },
      { id: 'e4', name: 'Short Circuit', desc: 'Main line or control circuit breaker tripped' },
      { id: 'e5', name: 'Control Panel Error', desc: '24V DC control transformer drop out or panel alarm' },
      { id: 'e6', name: 'Power Supply Failure', desc: 'SMPS 24V power supply module output failure' },
      { id: 'e7', name: 'Emergency Stop Fault', desc: 'Safety relay line locked open' },
      { id: 'e8', name: 'Motor Failure', desc: 'Pump or drive motor phase failure / winding burn' },
      { id: 'e9', name: 'Contactor Failure', desc: 'Main power contactor coil open or contact weld' }
    ]
  },
  {
    id: 'sensor',
    name: 'Sensor / Instrumentation',
    department: 'Automation Engineer',
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    faults: [
      { id: 's1', name: 'Distance Sensor Not Working', desc: 'LVDT / Analog distance sensor signal lost' },
      { id: 's2', name: 'Distance Sensor Malfunction', desc: 'Distance measurement feedback erratic' },
      { id: 's3', name: 'Positional Error', desc: 'Stroke end position proximity switch missing signal' },
      { id: 's4', name: 'Sensor Misalignment', desc: 'Optical or inductive sensor physically bumped out of position' },
      { id: 's5', name: 'Sensor Cable Damage', desc: 'Broken wire or severed shielding on sensor connector' },
      { id: 's6', name: 'Encoder Error', desc: 'Rotary encoder pulse count error or noise trip' },
      { id: 's7', name: 'I/O Module Fault', desc: 'Remote I/O expansion module bus communication error' }
    ]
  },
  {
    id: 'vision',
    name: 'Vision System',
    department: 'Automation Engineer',
    color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    faults: [
      { id: 'v1', name: 'Camera Bug', desc: 'Inspection software application crash or freeze' },
      { id: 'v2', name: 'Camera Detection Failure', desc: 'Back cover defect detection false rejection' },
      { id: 'v3', name: 'Camera Calibration Required', desc: 'Optical focus or pixel coordinate calibration drift' },
      { id: 'v4', name: 'Lighting Issue', desc: 'Ring light / Backlight LED intensity drop' },
      { id: 'v5', name: 'Vision Processing Error', desc: 'Image frame grabber buffer timeout' }
    ]
  },
  {
    id: 'automation',
    name: 'Automation / PLC',
    department: 'Automation Engineer',
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    faults: [
      { id: 'a1', name: 'PLC Program Error', desc: 'PLC CPU watchdog halt or ladder logic fault' },
      { id: 'a2', name: 'Automation Update Required', desc: 'Part recipe parameter update pending' },
      { id: 'a3', name: 'Automation I/O Change', desc: 'Tooling modification input pin mapping required' },
      { id: 'a4', name: 'Script Lock', desc: 'HMI macro script execution deadlock' },
      { id: 'a5', name: 'Limit Reached Lock', desc: 'Axis software stroke limit reached error' },
      { id: 'a6', name: 'Timing Zone Change Error', desc: 'Index feeder synchronization angle timing offset' },
      { id: 'a7', name: 'Network Error', desc: 'Profinet / EtherNET IP communication drop' },
      { id: 'a8', name: 'IP Address Changed', desc: 'Network node IP address conflict' },
      { id: 'a9', name: 'PLC Offline', desc: 'Main PLC CPU unpowered or disconnected' },
      { id: 'a10', name: 'Communication Error', desc: 'HMI to PLC communication failure' },
      { id: 'a11', name: 'Servo Error', desc: 'Servo drive overcurrent or tracking error alarm' },
      { id: 'a12', name: 'Parameter Reset', desc: 'Drive memory parameter corruption' },
      { id: 'a13', name: 'HMI Error', desc: 'Operator touchscreen screen frozen' }
    ]
  },
  {
    id: 'quality',
    name: 'Quality Defects',
    department: 'Supervisor',
    color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    faults: [
      { id: 'q1', name: 'Stock Variation', desc: 'Metal strip hardness or gauge out of specification' },
      { id: 'q2', name: 'Burr', desc: 'Excessive sharp burr on blanked watch back cover perimeter' },
      { id: 'q3', name: 'Scratch', desc: 'Surface gouge caused by die or feeder rubbing' },
      { id: 'q4', name: 'Dent', desc: 'Impression mark caused by foreign scrap in cavity' },
      { id: 'q5', name: 'Improper Forming', desc: 'Incomplete coin forming or bevel depth fault' },
      { id: 'q6', name: 'Dimension Out', desc: 'Outer diameter or thickness out of drawing tolerance' },
      { id: 'q7', name: 'Part Missing', desc: 'Blank feeder skipped loading raw part into die' }
    ]
  },
  {
    id: 'safety',
    name: 'Safety',
    department: 'Electrical Maintenance',
    color: 'bg-red-500/10 text-red-500 border-red-500/20',
    faults: [
      { id: 'sf1', name: 'Safety Rope Stuck', desc: 'Emergency pull rope tripped or jammed' },
      { id: 'sf2', name: 'Emergency Stop Failure', desc: 'E-stop button fails to trip master safety circuit' },
      { id: 'sf3', name: 'Door Interlock Failure', desc: 'Safety guard door switch contact open' },
      { id: 'sf4', name: 'Safety Sensor Fault', desc: 'Light curtain optical alignment trip error' }
    ]
  },
  {
    id: 'utilities',
    name: 'Utilities',
    department: 'Mechanical Maintenance',
    color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    faults: [
      { id: 'u1', name: 'Air Pressure Low', desc: 'Plant pneumatic air line pressure dropped below 5.5 bar' },
      { id: 'u2', name: 'Hydraulic Pressure Low', desc: 'Main hydraulic accumulator / pump pressure drop' },
      { id: 'u3', name: 'Cooling Failure', desc: 'Hydraulic oil heat exchanger cooling water flow stop' },
      { id: 'u4', name: 'Power Failure', desc: 'Main 415V plant power phase drop or black out' }
    ]
  }
];

export const INITIAL_COMPLAINTS = [
  {
    id: 'CMP-2026-101',
    machineId: 'M-6050005',
    machineName: 'Hydraulic Press 6050005',
    operatorName: 'Ramesh Kumar',
    employeeId: 'EMP-4403',
    department: 'Back Cover Dept',
    shift: 'Shift A',
    categoryId: 'mechanical',
    categoryName: 'Mechanical Maintenance',
    faultName: 'Oil Leakage',
    priority: 'Critical',
    description: 'Severe oil dripping from main ram cylinder seal assembly onto press bed.',
    imageUrl: null,
    status: 'Repair Started',
    assignedTechnician: 'Suresh V (Mechanical)',
    createdTime: '2026-08-03T08:15:00.000Z',
    assignedTime: '2026-08-03T08:18:00.000Z',
    acceptedTime: '2026-08-03T08:22:00.000Z',
    repairStartedTime: '2026-08-03T08:30:00.000Z',
    completedTime: null,
    verifiedTime: null,
    remarks: 'Replacing damaged main O-ring seal and tightening flange bolts.',
    partsChanged: 'Polyurethane Hydraulic Cylinder Seal (Size 120mm)'
  },
  {
    id: 'CMP-2026-102',
    machineId: 'M-6036004',
    machineName: 'Friction Press 6036004',
    operatorName: 'Anil Sharma',
    employeeId: 'EMP-3911',
    department: 'Back Cover Dept',
    shift: 'Shift A',
    categoryId: 'mechanical',
    categoryName: 'Mechanical Maintenance',
    faultName: 'Wheel Breakdown',
    priority: 'High',
    description: 'Friction wheel roller bearing fracture during stroke.',
    imageUrl: null,
    status: 'Assigned',
    assignedTechnician: 'Suresh V (Mechanical)',
    createdTime: '2026-08-03T09:10:00.000Z',
    assignedTime: '2026-08-03T09:14:00.000Z',
    acceptedTime: null,
    repairStartedTime: null,
    completedTime: null,
    verifiedTime: null,
    remarks: 'Assigned to Mechanical Maintenance for bearing replacement.',
    partsChanged: ''
  },
  {
    id: 'CMP-2026-103',
    machineId: 'M-6049004',
    machineName: 'Crank Press 6049004',
    operatorName: 'Priya Nair',
    employeeId: 'EMP-5104',
    department: 'Back Cover Dept',
    shift: 'Shift A',
    categoryId: 'electrical',
    categoryName: 'Electrical Maintenance',
    faultName: 'Push Button Jammed',
    priority: 'Medium',
    description: 'Manual inching push button physically stuck inside control pendant.',
    imageUrl: null,
    status: 'Completed',
    assignedTechnician: 'Karthik M (Electrical)',
    createdTime: '2026-08-03T06:45:00.000Z',
    assignedTime: '2026-08-03T06:48:00.000Z',
    acceptedTime: '2026-08-03T06:50:00.000Z',
    repairStartedTime: '2026-08-03T06:55:00.000Z',
    completedTime: '2026-08-03T07:20:00.000Z',
    verifiedTime: null,
    remarks: 'Cleaned oil sludge from push button housing and replaced spring.',
    partsChanged: '22mm Green Push Button Contact Block'
  }
];

export const TECHNICIANS = [
  { id: 'tech1', name: 'Suresh V', role: 'Mechanical Maintenance', status: 'On Job', phone: '+91 98765 43210' },
  { id: 'tech2', name: 'Karthik M', role: 'Electrical Maintenance', status: 'Available', phone: '+91 98765 43211' },
  { id: 'tech3', name: 'Vikram R', role: 'Automation Engineer', status: 'Assigned', phone: '+91 98765 43212' },
  { id: 'tech4', name: 'Mahesh P', role: 'Mechanical Maintenance', status: 'Available', phone: '+91 98765 43213' }
];
