# A Framework for Meaningful Choice: Designing Event Systems Beyond Good and Evil

**Author:** Manus AI
**Date:** 2026-02-27

## 1. Introduction: The Problem with Moral Absolutes

The current event system often presents players with choices that have a clear moral leaning, where one option is transparently "good" and another is transparently "evil." This binary approach, while simple to implement, fundamentally fails to create compelling and meaningful decisions. It reduces complex ethical dilemmas to a simplistic game of accumulating "good points" or "bad points," a phenomenon well-documented in game design analysis [1].

This design pattern leads to what is known as a "Dominant Moral Strategy." Players, consciously or unconsciously, identify the optimal path for their desired outcome (e.g., the path that yields the best rewards or avoids punishment) and consistently choose it, regardless of the specific context of the decision. The choice is no longer a reflection of the player's values or a thoughtful engagement with the dilemma, but a mechanical optimization. Games like *Infamous* and the *Knights of the Old Republic* series, with their light/dark side meters, exemplify this issue. Players are often punished for taking a middle ground, forcing them into extreme, and ultimately less interesting, character archetypes [2].

Our goal is to move beyond this outdated model. We aim to create an event system where choices are not about being a saint or a villain, but about navigating the difficult and often ambiguous landscape of human values. The key is to design choices where every option is a valid reflection of a different mindset, personality, or priority. As observed in the design of *The Witcher 3*, the most powerful choices are not between right and wrong, but between two different, often conflicting, rights [3]. This document outlines a philosophical and psychological framework to achieve that goal.

---
## 2. Philosophical Foundations: The Lenses of Choice

To create choices that are genuinely multifaceted, we can draw from major schools of ethical thought. Instead of a single moral yardstick, these philosophies provide different lenses through which a situation can be evaluated. A player's choice might align with one of these frameworks, reflecting a deeper underlying worldview rather than a simple desire to be "good."

We will focus on three primary ethical frameworks:

| Ethical Framework | Core Principle | Guiding Question for a Player | Example in-game action |
| :--- | :--- | :--- | :--- |
| **Utilitarianism** | The best action is the one that maximizes overall happiness and minimizes suffering for the greatest number of people. | "Which option leads to the best overall outcome for the community?" | Sacrificing a rare resource to cure a plague affecting a whole village. |
| **Deontology** | Certain actions are inherently right or wrong, based on a set of rules or duties, regardless of the consequences. | "What is my duty? What rule must I follow, regardless of the outcome?" | Refusing to lie to a dangerous tyrant, even if the lie could prevent immediate harm. |
| **Virtue Ethics** | Morality is about developing a virtuous character. The right action is the one a virtuous person would perform. | "What would a courageous/compassionate/just person do in this situation?" | Standing up for a marginalized individual at great personal risk, not for the outcome, but because it is the courageous thing to do. |

By designing choices that appeal to these different ethical logics, we create dilemmas without a single "correct" answer. A utilitarian player might choose to sacrifice one person to save five, a deontological player might refuse to do so on the principle that killing is always wrong, and a virtue ethicist might make a choice based on what demonstrates the virtue of compassion or courage in that specific context. None of these choices are inherently evil; they are simply the result of applying a different, internally consistent moral logic [4].

---
## 3. Psychological Dimensions: The Drivers of Choice

Beyond abstract philosophical principles, choices are driven by deep-seated psychological values and cognitive styles. To create choices that feel authentic, we must model these internal drivers. We will use two well-established psychological frameworks for this: Shalom H. Schwartz's Theory of Basic Human Values and Jonathan Haidt's Moral Foundations Theory.

### 3.1. Schwartz's Theory of Basic Human Values: What We Strive For

Schwartz's theory identifies ten universal values that are recognized across all human cultures. These values represent broad motivational goals. By designing choices that pit these values against each other, we create conflicts that are inherently relatable and complex. A player isn't choosing between good and evil, but between two competing goods, such as security and freedom, or tradition and novelty [5].

| Value Dimension | Motivational Goal | Example Choice Dilemma |
| :--- | :--- | :--- |
| **Self-Direction** | Independent thought and action, freedom, creativity. | Follow a prescribed, safe path, or explore a dangerous, unknown route that might lead to a great discovery? |
| **Stimulation** | Excitement, novelty, and challenge in life. | Settle into a comfortable routine, or embrace a risky but thrilling new adventure? |
| **Hedonism** | Pleasure and sensuous gratification. | Endure a difficult trial for a future reward, or indulge in an immediate pleasure with potential negative consequences? |
| **Achievement** | Personal success through demonstrating competence. | Collaborate on a project for a guaranteed shared success, or compete for individual glory with a high risk of failure? |
| **Power** | Social status, prestige, and control over resources. | Share resources equally with the community, or consolidate them to increase personal influence and authority? |
| **Security** | Safety, harmony, and stability of society and self. | Uphold a strict law that ensures order but limits freedom, or allow for more personal liberty at the risk of social instability? |
| **Conformity** | Restraint of actions that could harm others or violate norms. | Challenge a respected but unjust tradition, or uphold it to maintain social harmony? |
| **Tradition** | Respect for and acceptance of cultural or religious customs. | Adopt a new, more efficient technology that disrupts old ways of life, or preserve the traditional methods? |
| **Benevolence** | Preserving the welfare of one's in-group. | Help a close friend with a questionable task, or refuse and risk the friendship to uphold a universal principle? |
| **Universalism** | Understanding, tolerance, and protection for all people and nature. | Protect your own community's interests, or make a sacrifice to help a rival community or a struggling ecosystem? |

### 3.2. Moral Foundations Theory: The Intuitive Gut-Check

Developed by Jonathan Haidt, Moral Foundations Theory proposes that our moral judgments are often rapid, intuitive reactions based on six innate psychological systems [6]. These foundations explain why certain actions feel viscerally right or wrong. Choices can be designed to trigger conflicts between these foundations.

| Moral Foundation | Core Intuition | Example Choice Dilemma |
| :--- | :--- | :--- |
| **Care vs. Harm** | Compassion for the suffering of others. | Administer a painful but life-saving procedure to someone against their will? |
| **Fairness vs. Cheating** | Justice, rights, and proportionality. | Distribute a life-saving medicine equally to all, or give it to those who contributed most to its creation? |
| **Loyalty vs. Betrayal** | Faithfulness to one's group, tribe, or nation. | Expose a wrongdoing committed by a member of your own faction, or cover it up to protect the group's reputation? |
| **Authority vs. Subversion** | Respect for legitimate traditions and hierarchies. | Obey a flawed but respected leader's command, or defy them and risk chaos? |
| **Purity vs. Degradation** | Aversion to things that feel disgusting or unnatural. | Use a powerful but grotesque form of magic to achieve a noble goal? |
| **Liberty vs. Oppression** | Resentment of domination and restriction of freedom. | Submit to a benevolent ruler who provides safety and prosperity but demands total obedience? |

By framing choices as conflicts between these core values and moral foundations, we move away from a simple good/evil axis and into a multi-dimensional space of ethical decision-making.

---
## 4. The Quadrant Framework for Choice Design

To translate these abstract theories into a practical design tool, we propose the **Quadrant Framework for Choice Design**. This framework helps categorize and create choices by mapping them onto two key psychological axes: **Decision-Making Style** and **Motivational Focus**.

*   **X-Axis: Decision-Making Style (Process-Oriented)**: This axis, inspired by Kahneman's dual-process theory [7], represents how a player might process the decision. It ranges from **Intuitive** (fast, emotional, gut-feeling) to **Rational** (slow, analytical, cost-benefit calculation).
*   **Y-Axis: Motivational Focus (Outcome-Oriented)**: This axis, drawing from Schwartz's value structure, represents whose interests are being prioritized. It ranges from **Other-Focused** (prioritizing community, rules, and others' well-being) to **Self-Focused** (prioritizing personal gain, freedom, and achievement).

This creates four distinct quadrants, each representing a different archetype of choice. A well-designed event should ideally offer options that fall into at least two, if not more, of these quadrants, ensuring a genuine dilemma that appeals to different player psychologies.

![Quadrant Framework for Choice Design](https://i.imgur.com/example.png)  *(Placeholder for a diagram to be created)*

| Quadrant | Archetype | Description | Player Mentality |
| :--- | :--- | :--- | :--- |
| **I. Principled Stand** | **Rational & Other-Focused** | The choice is made based on a logical analysis of what is best for the group, or what aligns with a universal law or duty. It is a calculated decision for the greater good. | "The logical choice is to follow the rule that benefits everyone."
(Deontology, Utilitarianism, Universalism, Security) |
| **II. Pragmatic Move** | **Rational & Self-Focused** | The choice is a calculated move to maximize personal benefit, status, or resources. It is a strategic decision based on a cost-benefit analysis for the self. | "The most logical way to get ahead is to choose this option."
(Achievement, Power, Self-Direction) |
| **III. Gut Reaction** | **Intuitive & Other-Focused** | The choice is driven by an immediate, emotional response to another's plight or a sense of loyalty. It is a heartfelt, impulsive act of compassion or solidarity. | "I feel like I have to help them, no matter the cost!"
(Benevolence, Loyalty, Care Foundation) |
| **IV. Impulsive Act** | **Intuitive & Self-Focused** | The choice is driven by a desire for immediate gratification, excitement, or the expression of personal freedom. It is a spontaneous, gut-level decision for oneself. | "This looks more fun/exciting/freeing, I'm doing it!"
(Hedonism, Stimulation, Liberty Foundation) |

By using this framework, we can consciously design choices that are not better or worse, but simply *different*, appealing to distinct, recognizable modes of human decision-making.

---
## 5. Conclusion: A New Philosophy of Choice

By abandoning the simplistic good-versus-evil dichotomy and embracing a more nuanced, psychologically-grounded approach, we can create an event system that is far more engaging and meaningful. This framework, rooted in established ethical and psychological theories, provides a robust toolkit for designing choices that are not about accumulating moral points, but about expressing and exploring a player's own values.

Each decision becomes a small reflection of the player's character: Are they a pragmatist who prioritizes results, a principled idealist who follows a code, a compassionate soul who acts on empathy, or a free spirit who values personal liberty above all? By presenting choices that map to these different ways of being, we allow for genuine role-playing and create a narrative that is truly responsive to the player's unique identity.

The implementation of this framework will require a shift in our event writing process. It demands a more thoughtful approach to crafting dilemmas, where the focus is on creating a balanced conflict between competing values rather than a simple test of morality. The result, however, will be a richer, more memorable player experience that respects the player's intelligence and capacity for complex moral thought.

## 6. References

[1] B. Perdue, "Ethical Dilemmas and Dominant Moral Strategies In Games," *Game Developer*, 2011. [Online]. Available: https://www.gamedeveloper.com/design/ethical-dilemmas-and-dominant-moral-strategies-in-games

[2] J. Bycer, "How the Witcher Ruined Morality Systems for Me," *Super Jump Magazine*, Feb. 14, 2023. [Online]. Available: https://www.superjumpmagazine.com/how-the-witcher-ruined-morality-systems-for-me/

[3] Gamerant, "Most Morally Gray Decisions In The Witcher 3," *Gamerant*, Nov. 21, 2024. [Online]. Available: https://gamerant.com/witcher-3-most-morally-gray-decisions/

[4] J. Dimmock and A. Fisher, "Ethics - The Three Main Approaches," *Philosophical Thought*, 2017. [Online]. Available: https://www.philosophos.org/ethical-theories-virtue-ethics-utilitarianism-deontology

[5] S. H. Schwartz, "An Overview of the Schwartz Theory of Basic Values," *Online Readings in Psychology and Culture*, vol. 2, no. 1, 2012. [Online]. Available: https://scholarworks.gvsu.edu/orpc/vol2/iss1/8/

[6] J. Haidt and J. Graham, "Moral Foundations Theory," *moralfoundations.org*. [Online]. Available: https://moralfoundations.org/

[7] D. Kahneman, *Thinking, Fast and Slow*. Farrar, Straus and Giroux, 2011.
