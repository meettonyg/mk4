/**
 * Pods Data Integration - Self-Contained Architecture
 * Automatically populates components with Pods data based on component type
 * No manual patches - integrates at the root level when components are created
 */

export class PodsDataIntegration {
  constructor() {
    this.podsData = window.gmkbData?.pods_data || {};
    this.componentDataMap = this.createComponentDataMap();
  }

  /**
   * Create mapping of component types to their Pods data fields
   * This respects the self-contained architecture - each component knows its data needs
   */
  createComponentDataMap() {
    return {
      biography: {
        fields: ['biography', 'biography_short'],
        transform: (pods) => ({
          biography: pods.biography || pods.biography_short || ''
        })
      },
      
      hero: {
        fields: ['first_name', 'last_name', 'guest_title', 'tagline'],
        transform: (pods) => ({
          title: `${pods.first_name || ''} ${pods.last_name || ''}`.trim() || 'Guest Name',
          subtitle: pods.guest_title || '',
          description: pods.tagline || ''
        })
      },
      
      'guest-intro': {
        fields: ['first_name', 'last_name', 'guest_title', 'company', 'introduction', 'tagline'],
        transform: (pods) => ({
          first_name: pods.first_name || '',
          last_name: pods.last_name || '',
          full_name: `${pods.first_name || ''} ${pods.last_name || ''}`.trim(),
          guest_title: pods.guest_title || '',
          company: pods.company || '',
          introduction: pods.introduction || '',
          tagline: pods.tagline || ''
        })
      },
      
      'topics-questions': {
        fields: ['topic_1', 'topic_2', 'topic_3', 'topic_4', 'topic_5', 'question_1', 'question_2', 'question_3', 'question_4', 'question_5'],
        transform: (pods) => {
          const data = {};
          
          // Collect topics
          for (let i = 1; i <= 5; i++) {
            if (pods[`topic_${i}`]) {
              data[`topic_${i}`] = pods[`topic_${i}`];
            }
          }
          
          // Collect questions
          for (let i = 1; i <= 25; i++) {
            if (pods[`question_${i}`]) {
              data[`question_${i}`] = pods[`question_${i}`];
            }
          }
          
          return data;
        }
      },
      
      topics: {
        fields: ['topic_1', 'topic_2', 'topic_3', 'topic_4', 'topic_5'],
        transform: (pods) => {
          const topics = [];
          for (let i = 1; i <= 5; i++) {
            if (pods[`topic_${i}`]) {
              topics.push(pods[`topic_${i}`]);
            }
          }
          return { topics };
        }
      },
      
      contact: {
        fields: ['email', 'phone', 'website', 'linkedin', 'twitter', 'facebook'],
        transform: (pods) => ({
          email: pods.email || '',
          phone: pods.phone || '',
          website: pods.website || '',
          linkedin: pods.linkedin || '',
          twitter: pods.twitter || '',
          facebook: pods.facebook || ''
        })
      },
      
      questions: {
        fields: ['question_1', 'question_2', 'question_3', 'question_4', 'question_5', 'question_6', 'question_7', 'question_8', 'question_9', 'question_10'],
        transform: (pods) => {
          const questions = [];
          for (let i = 1; i <= 10; i++) {
            if (pods[`question_${i}`]) {
              questions.push(pods[`question_${i}`]);
            }
          }
          return { questions };
        }
      }
    };
  }

  /**
   * Get Pods data for a specific component type
   * Returns transformed data ready for the component
   */
  getComponentData(componentType) {
    const mapping = this.componentDataMap[componentType];
    if (!mapping) {
      return {}; // Component type doesn't use Pods data
    }

    // Check if we have any relevant Pods data
    const hasData = mapping.fields.some(field => this.podsData[field]);
    if (!hasData) {
      return {}; // No Pods data available for this component
    }

    // Transform the data for the component
    return mapping.transform(this.podsData);
  }

  /**
   * ROOT FIX: Mark component as Pods-enabled without copying content
   * Components should fetch Pods data at render time, not store it
   */
  enrichComponentData(component) {
    const mapping = this.componentDataMap[component.type];
    
    if (mapping) {
      // Don't copy Pods data into component
      // Instead, just mark it as Pods-enabled with field references
      component.data = {
        dataSource: 'pods',
        fields: mapping.fields,
        // Only store field mapping, not actual content
      };
      
      // Configuration only - no content
      component.config = component.config || {};
      
      // Props should be empty - content comes from Pods at render time
      component.props = {};
      
      console.log(`✅ Configured ${component.type} component to use Pods fields:`, mapping.fields);
    }
    
    return component;
  }

  /**
   * Check if Pods data is available
   */
  hasPodsData() {
    return Object.keys(this.podsData).length > 0;
  }

  /**
   * Update Pods data (if it changes)
   */
  updatePodsData(newPodsData) {
    this.podsData = newPodsData || {};
  }
}

// Create singleton instance
const podsDataIntegration = new PodsDataIntegration();

// Export for use in other modules
export default podsDataIntegration;
