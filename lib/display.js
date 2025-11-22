/**
 * Terminal Display Formatter
 *
 * Formats extracted brand data into clean, readable terminal output
 * with color swatches, tables, and confidence indicators.
 */

import chalk from 'chalk';
import Table from 'cli-table3';

/**
 * Main display function - outputs formatted extraction results to terminal
 * @param {Object} data - Extraction results from extractBranding()
 */
export function displayResults(data) {
  console.log('\n' + chalk.bold.cyan('='.repeat(60)));
  console.log(chalk.bold.cyan('  BRAND EXTRACTION REPORT'));
  console.log(chalk.bold.cyan('='.repeat(60)) + '\n');

  console.log(chalk.bold('URL: ') + chalk.blue(data.url));
  console.log(chalk.dim('Extracted at: ' + data.extractedAt) + '\n');

  displayLogo(data.logo);
  displayColors(data.colors);
  displayTypography(data.typography);
  displaySpacing(data.spacing);
  displayBorderRadius(data.borderRadius);
  displayShadows(data.shadows);
  displayButtons(data.components?.buttons);
  displayInputs(data.components?.inputs);
  displayBreakpoints(data.breakpoints);
  displayIconSystem(data.iconSystem);
  displayFrameworks(data.frameworks);

  console.log('\n' + chalk.dim('─'.repeat(60)) + '\n');
}

function displayLogo(logo) {
  console.log(chalk.bold.yellow('LOGO'));
  console.log(chalk.dim('─'.repeat(60)));
  if (logo) {
    console.log(`Source: ${logo.source}`);
    if (logo.url) console.log(`URL: ${chalk.blue(logo.url)}`);
    if (logo.width) console.log(`Dimensions: ${logo.width}x${logo.height}px`);
    if (logo.alt) console.log(`Alt text: ${logo.alt}`);
  } else {
    console.log(chalk.dim('No logo detected'));
  }
  console.log('');
}

function displayColors(colors) {
  console.log(chalk.bold.yellow('COLORS'));
  console.log(chalk.dim('─'.repeat(60)));

  if (colors.semantic) {
    const semantic = colors.semantic;
    const semanticEntries = Object.entries(semantic).filter(([_, color]) => color);

    if (semanticEntries.length > 0) {
      console.log(chalk.bold('Semantic Colors:'));
      semanticEntries.forEach(([role, color]) => {
        const colorBlock = chalk.bgHex(color)('   ') + ' ';
        console.log(`  ${colorBlock}${chalk.cyan(role.padEnd(12))}: ${color}`);
      });
      console.log('');
    }
  }

  if (colors.cssVariables && Object.keys(colors.cssVariables).length > 0) {
    console.log(chalk.bold('CSS Variables (Brand-Specific):'));
    const cssVarEntries = Object.entries(colors.cssVariables);

    cssVarEntries.slice(0, 10).forEach(([name, value]) => {
      try {
        const colorBlock = chalk.bgHex(value)('   ') + ' ';
        console.log(`  ${colorBlock}${chalk.cyan(name)}: ${value}`);
      } catch {
        // Not a valid hex color, show without swatch
        console.log(`  ${chalk.cyan(name)}: ${value}`);
      }
    });

    if (cssVarEntries.length > 10) {
      console.log(chalk.dim(`  (${cssVarEntries.length - 10} more variables in saved JSON file)`));
    }
    console.log('');
  }

  if (colors.palette.length > 0) {
    const brandColors = colors.palette.filter(c =>
      c.confidence === 'high' || c.confidence === 'medium'
    );

    if (brandColors.length > 0) {
      const colorTable = new Table({
        head: [chalk.bold('Color'), chalk.bold('Confidence'), chalk.bold('Usage'), chalk.bold('Sources')],
        style: { head: [], border: [] },
        colWidths: [20, 12, 8, 25]
      });

      brandColors.slice(0, 12).forEach(c => {
        const colorBlock = chalk.bgHex(c.color)('   ') + ' ' + c.color;

        let confidenceDisplay;
        if (c.confidence === 'high') {
          confidenceDisplay = chalk.green('● High');
        } else if (c.confidence === 'medium') {
          confidenceDisplay = chalk.yellow('● Medium');
        } else {
          confidenceDisplay = chalk.gray('● Low');
        }

        const sourcesDisplay = c.sources && c.sources.length > 0
          ? c.sources.join(', ')
          : '-';

        colorTable.push([
          colorBlock,
          confidenceDisplay,
          c.count,
          sourcesDisplay
        ]);
      });

      console.log(colorTable.toString());

      const lowConfCount = colors.palette.length - brandColors.length;
      if (lowConfCount > 0) {
        console.log(chalk.dim(`  (${lowConfCount} additional low-confidence colors hidden)`));
      }
    } else {
      console.log(chalk.dim('No brand colors detected'));
    }
  } else {
    console.log(chalk.dim('No dominant colors detected'));
  }
  console.log('');
}

function displayTypography(typography) {
  console.log(chalk.bold.yellow('TYPOGRAPHY'));
  console.log(chalk.dim('─'.repeat(60)));

  if (typography.sources.googleFonts.length > 0) {
    console.log(chalk.bold('Google Fonts: ') + typography.sources.googleFonts.join(', '));
  }
  if (typography.sources.adobeFonts) {
    console.log(chalk.bold('Adobe Fonts: ') + 'Detected');
  }
  if (typography.sources.customFonts.length > 0) {
    console.log(chalk.bold('Custom Fonts: ') + typography.sources.customFonts.join(', '));
  }
  console.log('');

  if (typography.styles.length > 0) {
    const highConfidenceFonts = typography.styles.filter(s => s.confidence === 'high');

    if (highConfidenceFonts.length > 0) {
      const fontTable = new Table({
        head: [chalk.bold('Font Family'), chalk.bold('Size'), chalk.bold('Weight'), chalk.bold('Context')],
        style: { head: [], border: [] },
        colWidths: [32, 12, 10, 18]
      });

      highConfidenceFonts.slice(0, 6).forEach(style => {
        fontTable.push([
          style.fontFamily.split(',')[0].replace(/['"]/g, ''),
          style.fontSize + '\n' + chalk.dim(style.fontSizeRem),
          style.fontWeight,
          style.contexts.slice(0, 2).join(', ')
        ]);
      });

      console.log(fontTable.toString());

      const mediumCount = typography.styles.filter(s => s.confidence === 'medium').length;
      if (mediumCount > 0) {
        console.log(chalk.dim(`  (${mediumCount} additional medium-confidence font styles in saved JSON)`));
      }
    } else {
      console.log(chalk.dim('No high-confidence typography detected'));
    }
  }
  console.log('');
}

function displaySpacing(spacing) {
  console.log(chalk.bold.yellow('SPACING'));
  console.log(chalk.dim('─'.repeat(60)));
  console.log(chalk.bold('Scale Type: ') + spacing.scaleType);
  console.log(chalk.bold('Common Values: ') +
    spacing.commonValues.slice(0, 8).map(v => v.px).join(', '));
  console.log('');
}

function displayBorderRadius(borderRadius) {
  console.log(chalk.bold.yellow('BORDER RADIUS'));
  console.log(chalk.dim('─'.repeat(60)));
  if (borderRadius && borderRadius.values.length > 0) {
    const highConfRadius = borderRadius.values.filter(r => r.confidence === 'high' || r.confidence === 'medium');
    if (highConfRadius.length > 0) {
      console.log(chalk.bold('Common Values: ') +
        highConfRadius.slice(0, 5).map(v => `${v.value} (${v.count}×)`).join(', '));
    } else {
      console.log(chalk.dim('No common border radius detected'));
    }
  } else {
    console.log(chalk.dim('No border radius values detected'));
  }
  console.log('');
}

function displayShadows(shadows) {
  console.log(chalk.bold.yellow('SHADOWS'));
  console.log(chalk.dim('─'.repeat(60)));
  if (shadows && shadows.length > 0) {
    const highConfShadows = shadows.filter(s => s.confidence === 'high' || s.confidence === 'medium');
    if (highConfShadows.length > 0) {
      highConfShadows.slice(0, 4).forEach((s, i) => {
        const confIndicator = s.confidence === 'high' ? chalk.green('●') : chalk.yellow('●');
        console.log(`${confIndicator} ${s.shadow} ${chalk.dim('(' + s.count + '×)')}`);
      });
    } else {
      console.log(chalk.dim('No common shadows detected'));
    }
  } else {
    console.log(chalk.dim('No shadows detected'));
  }
  console.log('');
}

function displayButtons(buttons) {
  console.log(chalk.bold.yellow('BUTTON VARIANTS'));
  console.log(chalk.dim('─'.repeat(60)));
  if (buttons && buttons.length > 0) {
    const highConfButtons = buttons.filter(b => b.confidence === 'high');

    if (highConfButtons.length > 0) {
      highConfButtons.slice(0, 4).forEach((btn, i) => {
        console.log(`${chalk.green('●')} ${chalk.bgHex(btn.backgroundColor)('   ')} ${btn.backgroundColor} / ${btn.color}`);
        console.log(`   Padding: ${btn.padding}, Radius: ${btn.borderRadius}, Weight: ${btn.fontWeight}`);
        if (btn.classes) console.log(`   ${chalk.dim('Classes: ' + btn.classes)}`);
        console.log('');
      });

      const mediumCount = buttons.filter(b => b.confidence === 'medium').length;
      if (mediumCount > 0) {
        console.log(chalk.dim(`  (${mediumCount} additional medium-confidence button variants in saved JSON)`));
      }
    } else {
      console.log(chalk.dim('No high-confidence button styles detected'));
      console.log('');
    }
  } else {
    console.log(chalk.dim('No button styles detected'));
    console.log('');
  }
}

function displayInputs(inputs) {
  console.log(chalk.bold.yellow('INPUT STYLES'));
  console.log(chalk.dim('─'.repeat(60)));
  if (inputs && inputs.length > 0) {
    inputs.slice(0, 3).forEach((input, i) => {
      console.log(`${i + 1}. ${chalk.bold(input.type)}`);
      console.log(`   Border: ${input.border}`);
      console.log(`   Padding: ${input.padding}, Radius: ${input.borderRadius}`);
      if (input.focusStyles && input.focusStyles.outline !== 'none') {
        console.log(`   Focus: ${input.focusStyles.outline}`);
      }
      console.log('');
    });
  } else {
    console.log(chalk.dim('No input styles detected'));
    console.log('');
  }
}

function displayBreakpoints(breakpoints) {
  console.log(chalk.bold.yellow('BREAKPOINTS'));
  console.log(chalk.dim('─'.repeat(60)));
  if (breakpoints && breakpoints.length > 0) {
    console.log(breakpoints.map(bp => bp.px).join(' → '));
  } else {
    console.log(chalk.dim('No breakpoints detected'));
  }
  console.log('');
}

function displayIconSystem(iconSystem) {
  console.log(chalk.bold.yellow('ICON SYSTEM'));
  console.log(chalk.dim('─'.repeat(60)));
  if (iconSystem && iconSystem.length > 0) {
    iconSystem.forEach(system => {
      console.log(`• ${chalk.bold(system.name)} ${chalk.dim('(' + system.type + ')')}`);
      if (system.sizes) console.log(`  Sizes: ${system.sizes.join(', ')}`);
    });
  } else {
    console.log(chalk.dim('No icon system detected'));
  }
  console.log('');
}

function displayFrameworks(frameworks) {
  console.log(chalk.bold.yellow('FRAMEWORKS'));
  console.log(chalk.dim('─'.repeat(60)));
  if (frameworks.length > 0) {
    frameworks.forEach(fw => {
      const confidence = fw.confidence === 'high' ? chalk.green('●') : chalk.yellow('◐');
      console.log(`${confidence} ${chalk.bold(fw.name)} ${chalk.dim('(' + fw.evidence + ')')}`);
    });
  } else {
    console.log(chalk.dim('No frameworks detected'));
  }
  console.log('\n' + chalk.dim('─'.repeat(60)) + '\n');
}
