import JobForm from '../JobForm';

export default function JobFormExample() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <JobForm
        onSubmit={(data) => console.log("Form submitted:", data)}
        onCancel={() => console.log("Form cancelled")}
      />
    </div>
  );
}