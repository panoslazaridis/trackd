import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Wrench, 
  Hammer, 
  Wind, 
  Settings,
  ChevronRight,
  CheckCircle
} from "lucide-react";

interface BusinessType {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  avgHourlyRate: number;
  specializations: string[];
  commonServices: string[];
}

interface BusinessTypeSelectorProps {
  onSelect: (businessType: BusinessType) => void;
  onSkip?: () => void;
  className?: string;
}

const businessTypes: BusinessType[] = [
  {
    id: "electrical",
    name: "Electrical Services",
    icon: Zap,
    description: "Electrical installation, repair, and maintenance services",
    avgHourlyRate: 65,
    specializations: [
      "Emergency callouts (power outages, blown fuses, electrical faults)",
      "Socket and switch installations",
      "Consumer unit (fuse box) upgrades",
      "Lighting installations (indoor/outdoor)",
      "Electric shower installations",
      "Kitchen appliance installations",
      "Security system wiring",
      "Electric vehicle charging point installation",
      "PAT testing",
      "Electrical safety inspections",
      "Rewiring (partial/full house)",
      "Commercial electrical work",
      "Other"
    ],
    commonServices: [
      "Emergency callouts",
      "Socket and switch installations", 
      "Consumer unit upgrades",
      "Lighting installations"
    ]
  },
  {
    id: "plumbing", 
    name: "Plumbing Services",
    icon: Wrench,
    description: "Plumbing repairs, installations, and emergency services",
    avgHourlyRate: 55,
    specializations: [
      "Emergency callouts (burst pipes, blocked drains, boiler breakdowns)",
      "Bathroom installations (full/partial)",
      "Kitchen plumbing",
      "Boiler repairs and servicing",
      "Central heating installations",
      "Toilet repairs and replacements",
      "Tap and valve installations",
      "Pipe repairs and replacements",
      "Drain cleaning and unblocking",
      "Water heater installations",
      "Radiator installations",
      "Leak detection and repairs",
      "Gas safety inspections",
      "Other"
    ],
    commonServices: [
      "Emergency callouts",
      "Bathroom installations",
      "Kitchen plumbing",
      "Boiler repairs and servicing"
    ]
  },
  {
    id: "hvac",
    name: "HVAC Services",
    icon: Wind,
    description: "Heating, ventilation, and air conditioning services",
    avgHourlyRate: 70,
    specializations: [
      "Boiler installations",
      "Boiler repairs and servicing",
      "Central heating system installations",
      "Air conditioning installations",
      "Ventilation system installations",
      "Heat pump installations",
      "Radiator replacements",
      "Thermostat installations",
      "Ductwork installations",
      "Gas safety checks",
      "Annual boiler services",
      "Emergency heating repairs",
      "Smart heating system installations",
      "Other"
    ],
    commonServices: [
      "Boiler installations",
      "Air conditioning installations",
      "Central heating systems",
      "Heat pump installations"
    ]
  },
  {
    id: "building",
    name: "General Building & Construction",
    icon: Hammer,
    description: "Building, construction, and renovation services",
    avgHourlyRate: 50,
    specializations: [
      "Home extensions",
      "Loft conversions", 
      "Kitchen renovations",
      "Bathroom renovations",
      "Roofing repairs and replacements",
      "Foundation work",
      "Structural repairs",
      "Insulation installations",
      "Driveway installations",
      "Garage constructions",
      "Shed and outbuilding construction",
      "Planning and building regulation applications",
      "Other"
    ],
    commonServices: [
      "Home extensions",
      "Kitchen renovations",
      "Bathroom renovations",
      "Roofing repairs"
    ]
  },
  {
    id: "carpentry",
    name: "Carpentry & Joinery", 
    icon: Hammer,
    description: "Custom carpentry, furniture making, and woodwork projects",
    avgHourlyRate: 45,
    specializations: [
      "Kitchen fitting",
      "Built-in wardrobes and storage",
      "Door installations and repairs",
      "Window installations and repairs",
      "Flooring installations (wood, laminate)",
      "Staircase installations and repairs",
      "Skirting and architrave installations",
      "Bespoke furniture making",
      "Shelving installations",
      "Decking construction",
      "Fence installations",
      "Property maintenance carpentry",
      "Other"
    ],
    commonServices: [
      "Kitchen fitting",
      "Built-in wardrobes",
      "Door installations",
      "Flooring installations"
    ]
  },
  {
    id: "painting",
    name: "Painting & Decorating",
    icon: Settings,
    description: "Interior and exterior painting and decorating services",
    avgHourlyRate: 40,
    specializations: [
      "Interior painting (rooms, hallways, stairwells)",
      "Exterior painting (houses, fences, outbuildings)",
      "Wallpaper hanging",
      "Wall preparation and repairs",
      "Ceiling painting and repairs",
      "Commercial painting projects",
      "Specialist finishes (textured, decorative)",
      "Paint removal and stripping",
      "Property maintenance painting",
      "Insurance work (post-damage restoration)",
      "Other"
    ],
    commonServices: [
      "Interior painting",
      "Exterior painting",
      "Wallpaper hanging",
      "Wall preparation"
    ]
  },
  {
    id: "roofing",
    name: "Roofing Services",
    icon: Settings,
    description: "Roofing repairs, installations, and maintenance",
    avgHourlyRate: 60,
    specializations: [
      "Roof repairs (tiles, slates, felt)",
      "Full roof replacements",
      "Gutter cleaning and repairs",
      "Chimney repairs and maintenance",
      "Flat roof installations and repairs",
      "Roof inspections and surveys",
      "Fascia and soffit repairs",
      "Roof insulation",
      "Skylight installations",
      "Emergency roof repairs (storm damage)",
      "Lead work",
      "Other"
    ],
    commonServices: [
      "Roof repairs",
      "Gutter cleaning",
      "Emergency roof repairs",
      "Chimney maintenance"
    ]
  },
  {
    id: "landscaping",
    name: "Landscaping & Groundwork",
    icon: Settings,
    description: "Garden design, landscaping, and outdoor services",
    avgHourlyRate: 35,
    specializations: [
      "Garden design and landscaping",
      "Patio and pathway installations",
      "Lawn installation and maintenance",
      "Tree surgery and removal",
      "Hedge cutting and maintenance",
      "Drainage systems",
      "Garden clearance",
      "Retaining wall construction",
      "Artificial grass installations",
      "Outdoor lighting installations",
      "Water feature installations",
      "Other"
    ],
    commonServices: [
      "Garden landscaping",
      "Patio installations",
      "Lawn maintenance",
      "Tree surgery"
    ]
  },
  {
    id: "handyman",
    name: "Handyman Services",
    icon: Settings,
    description: "General property maintenance and repair services",
    avgHourlyRate: 35,
    specializations: [
      "Property maintenance (multiple small jobs)",
      "Flat-pack furniture assembly",
      "Picture hanging and mounting",
      "Minor plumbing repairs",
      "Minor electrical work (non-certified)",
      "Door and lock repairs",
      "Window repairs",
      "Gutter cleaning",
      "Pressure washing",
      "Home security installations",
      "Appliance installations",
      "Other"
    ],
    commonServices: [
      "Property maintenance",
      "Furniture assembly",
      "Minor repairs",
      "Home installations"
    ]
  },
  {
    id: "glazing",
    name: "Glazing Services",
    icon: Settings,
    description: "Window, door, and glass installation services",
    avgHourlyRate: 50,
    specializations: [
      "Double glazing installations",
      "Window repairs and replacements",
      "Door installations (UPVC, composite, bi-fold)",
      "Conservatory installations",
      "Emergency glazing (broken windows)",
      "Glass replacements",
      "Mirror installations",
      "Shower screen installations",
      "Secondary glazing",
      "Commercial glazing",
      "Other"
    ],
    commonServices: [
      "Double glazing",
      "Window replacements",
      "Door installations",
      "Emergency glazing"
    ]
  },
  {
    id: "flooring",
    name: "Flooring Services",
    icon: Settings,
    description: "Floor installation, repair, and maintenance services",
    avgHourlyRate: 40,
    specializations: [
      "Carpet installations",
      "Laminate flooring installations",
      "Hardwood flooring installations",
      "Vinyl and LVT installations",
      "Tile installations (ceramic, porcelain, natural stone)",
      "Floor repairs and maintenance",
      "Underfloor heating installations",
      "Floor preparation and leveling",
      "Commercial flooring projects",
      "Flooring removals",
      "Other"
    ],
    commonServices: [
      "Carpet installations",
      "Laminate flooring",
      "Tile installations",
      "Floor repairs"
    ]
  },
  {
    id: "security",
    name: "Security & Locksmith Services",
    icon: Settings,
    description: "Security systems, locks, and access control services",
    avgHourlyRate: 55,
    specializations: [
      "Lock changes and upgrades",
      "Emergency lockout assistance",
      "Security system installations",
      "CCTV installations",
      "Alarm system installations",
      "Safe installations",
      "Key cutting services",
      "Door and window security upgrades",
      "Access control systems",
      "Security surveys and consultations",
      "Other"
    ],
    commonServices: [
      "Lock changes",
      "Emergency lockout",
      "Security systems",
      "CCTV installations"
    ]
  }
];

export default function BusinessTypeSelector({ 
  onSelect, 
  onSkip, 
  className = "" 
}: BusinessTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null);

  const handleSelect = (businessType: BusinessType) => {
    setSelectedType(businessType);
  };

  const handleConfirm = () => {
    if (selectedType) {
      onSelect(selectedType);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Welcome to trackd.app
        </h1>
        <p className="text-muted-foreground text-lg">
          Let's set up your business profile to provide personalized insights
        </p>
      </div>

      {/* Business Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">What type of trade business do you run?</CardTitle>
          <CardDescription>
            This helps us provide industry-specific insights and benchmarking data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType?.id === type.id;
              
              return (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all hover-elevate ${
                    isSelected ? "ring-2 ring-primary border-primary" : ""
                  }`}
                  onClick={() => handleSelect(type)}
                  data-testid={`card-business-type-${type.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-heading">
                            {type.name}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1">
                            £{type.avgHourlyRate}/hour avg
                          </CardDescription>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                    
                    <div>
                      <p className="text-xs font-medium text-foreground mb-2">
                        Common Services:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {type.commonServices.slice(0, 2).map((service) => (
                          <Badge key={service} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                        <Badge variant="secondary" className="text-xs">
                          +{type.specializations.length - 2} more
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Type Preview */}
      {selectedType && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <selectedType.icon className="w-5 h-5 text-primary" />
              {selectedType.name} Business Selected
            </CardTitle>
            <CardDescription>
              We'll set up your profile with {selectedType.name.toLowerCase()} industry data and benchmarks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Industry Average Rate:</span>
                <span className="font-medium">£{selectedType.avgHourlyRate}/hour</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Available Specializations:</span>
                <span className="font-medium">{selectedType.specializations.length} options</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        {onSkip && (
          <Button
            variant="outline"
            onClick={onSkip}
            data-testid="button-skip-business-type"
          >
            Skip for Now
          </Button>
        )}
        <Button
          onClick={handleConfirm}
          disabled={!selectedType}
          data-testid="button-confirm-business-type"
          className="min-w-[200px]"
        >
          Continue with {selectedType?.name || "Selection"}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

export { businessTypes };
export type { BusinessType };