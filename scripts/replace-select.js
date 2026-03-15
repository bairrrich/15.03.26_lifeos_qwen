const fs = require('fs');
const path = require('path');

const files = [
  'src/app/habits/page.tsx',
  'src/app/goals/page.tsx',
  'src/app/health/page.tsx',
  'src/app/nutrition/page.tsx',
  'src/app/mind/page.tsx',
  'src/app/beauty/page.tsx',
  'src/app/workouts/page.tsx',
  'src/app/automations/page.tsx',
  'src/app/(dashboard)/sharing/page.tsx',
  'src/app/(dashboard)/widgets/page.tsx',
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove Select imports
  content = content.replace(/import\s*\{\s*Select,\s*SelectContent,\s*SelectItem,\s*SelectTrigger,\s*SelectValue,?\s*\}\s*from\s*['"]@\/components\/ui\/select['"];\s*/g, '');
  
  // Replace Select components with native select
  content = content.replace(
    /<Select\s+name="([^"]+)"\s*(?:defaultValue="([^"]*)")?\s*(?:value=\{([^}]+)\})?\s*(?:onValueChange=\{([^}]+)\})?>\s*<SelectTrigger>\s*<SelectValue\s+placeholder="([^"]*)"\s*\/?>\s*<\/SelectTrigger>\s*<SelectContent>([\s\S]*?)<\/SelectContent>\s*<\/Select>/g,
    (match, name, defaultValue, value, onChange, placeholder, options) => {
      const optionMatches = options.match(/<SelectItem\s+value="([^"]+)">([^<]+)<\/SelectItem>/g) || [];
      const optionElements = optionMatches.map(opt => {
        const [, val, label] = opt.match(/<SelectItem\s+value="([^"]+)">([^<]+)<\/SelectItem>/);
        return `                      <option value="${val}">${label}</option>`;
      }).join('\n');
      
      return `<select
                    name="${name}"
                    ${defaultValue ? `defaultValue="${defaultValue}"` : ''}
                    ${value ? `value={${value}}` : ''}
                    ${onChange ? `onChange={${onChange}}` : ''}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">${placeholder}</option>
${optionElements}
                  </select>`;
    }
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Processed: ${file}`);
});

console.log('Done!');
